import { mat4 } from 'gl-matrix'

import { Mesh } from './mesh'

import {
  INSTANCED_OFFSET_MODEL_MATRIX,
  MODEL_MATRIX_UNIFORM_NAME,
  UNIFORM_TYPE_MATRIX4X4,
} from '../utils/gl-constants'

import { getExtension } from '../utils/gl-utils'
import { Geometry } from './geometry'

import { InstancedMeshInterface } from '../types'

export class InstancedMesh extends Mesh {
  #geometry: Geometry
  #gl: WebGLRenderingContext
  #instanceAttributes = new Map()
  #instanceExtension

  public instanceCount: number

  constructor(
    gl: WebGLRenderingContext,
    {
      geometry,
      uniforms,
      instanceCount = 1,
      vertexShaderSource,
      fragmentShaderSource,
    }: InstancedMeshInterface,
  ) {
    super(gl, { geometry, uniforms, vertexShaderSource, fragmentShaderSource })

    this.#gl = gl
    this.#geometry = geometry
    this.#instanceExtension = getExtension(gl, 'ANGLE_instanced_arrays')

    this.instanceCount = instanceCount

    // assign divisors to instanced attributes
    this.vaoExtension.bindVertexArrayOES(this.vao)
    geometry.attributes.forEach(({ instancedDivisor }, key) => {
      if (instancedDivisor) {
        const location = this.program.getAttribLocation(key)
        if (location === -1) {
          return
        }
        this.#instanceExtension.vertexAttribDivisorANGLE(
          location,
          instancedDivisor,
        )
      }
    })

    // initialize instance instanceModelMatrix attribute as identity matrix
    const instanceMatrixLocation = this.program.getAttribLocation(
      INSTANCED_OFFSET_MODEL_MATRIX,
    )
    const identityMat = mat4.create()
    const itemsPerInstance = 16
    const bytesPerMatrix = itemsPerInstance * Float32Array.BYTES_PER_ELEMENT
    const matrixData = new Float32Array(itemsPerInstance * instanceCount)

    for (let i = 0; i < instanceCount; i++) {
      for (
        let n = i * itemsPerInstance, j = 0;
        n < i * itemsPerInstance + itemsPerInstance;
        n++
      ) {
        matrixData[n] = identityMat[j]
        j++
      }
    }
    const matrixBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, matrixData, gl.DYNAMIC_DRAW)
    for (let i = 0; i < 4; i++) {
      const location = instanceMatrixLocation + i
      gl.enableVertexAttribArray(location)
      const offset = i * itemsPerInstance
      gl.vertexAttribPointer(
        location,
        4,
        gl.FLOAT,
        false,
        bytesPerMatrix,
        offset,
      )

      this.#instanceExtension.vertexAttribDivisorANGLE(location, 1)
    }
    this.vaoExtension.bindVertexArrayOES(null)

    this.#instanceAttributes.set(INSTANCED_OFFSET_MODEL_MATRIX, {
      location: instanceMatrixLocation,
      typedArray: matrixData,
      buffer: matrixBuffer,
      size: 4,
      stride: 4 * itemsPerInstance,
      instancedDivisor: 1,
    })
  }
  /**
   * @param {number} index - Instance index on which to apply the matrix
   * @param {Float32Array|Float64Array} matrix - Matrix to control the instance scale, rotation and translation
   */
  setMatrixAt(index: number, matrix: Float32Array): this {
    const itemsPerInstance = 16
    const { buffer } = this.#instanceAttributes.get(
      INSTANCED_OFFSET_MODEL_MATRIX,
    )
    this.vaoExtension.bindVertexArrayOES(this.vao)
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, buffer)
    this.#gl.bufferSubData(
      this.#gl.ARRAY_BUFFER,
      index * itemsPerInstance * Float32Array.BYTES_PER_ELEMENT,
      matrix,
    )

    this.vaoExtension.bindVertexArrayOES(null)
    return this
  }
  /**
   * Draws the instanced mesh
   */
  draw(): this {
    if (this.shouldUpdate) {
      super.updateModelMatrix()
      this.program.setUniform(
        MODEL_MATRIX_UNIFORM_NAME,
        UNIFORM_TYPE_MATRIX4X4,
        this.modelMatrix,
      )
    }
    this.program.bind()
    this.vaoExtension.bindVertexArrayOES(this.vao)
    if (this.hasIndices) {
      this.#instanceExtension.drawElementsInstancedANGLE(
        this.drawMode,
        this.#geometry.vertexCount,
        this.#gl.UNSIGNED_SHORT,
        0,
        this.instanceCount,
      )
    } else {
      this.#instanceExtension.drawArraysInstancedANGLE(
        this.drawMode,
        0,
        this.#geometry.vertexCount,
        this.instanceCount,
      )
    }
    this.vaoExtension.bindVertexArrayOES(null)
    return this
  }
}
