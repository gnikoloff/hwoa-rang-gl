import { mat4 } from 'gl-matrix'

import Mesh from './mesh'

import { INSTANCED_OFFSET_MODEL_MATRIX } from '../utils/gl-constants'
import { getExtension } from '../utils/gl-utils'
import Geometry from './geometry'
import { MeshInterface } from '../ts-types'

export default class InstancedMesh extends Mesh {
  #geometry: Geometry
  #gl: WebGLRenderingContext
  #instanceExtension

  public instanceCount: number
  public instanceAttributes = new Map()

  constructor(
    gl: WebGLRenderingContext,
    {
      geometry,
      uniforms,
      instanceCount = 1,
      vertexShaderSource,
      fragmentShaderSource,
    }: MeshInterface,
  ) {
    super(gl, { geometry, uniforms, vertexShaderSource, fragmentShaderSource })
    this.#gl = gl
    this.#geometry = geometry
    this.#instanceExtension = getExtension(gl, 'ANGLE_instanced_arrays')

    this.instanceCount = instanceCount

    const instanceMatrixLocation = this.program.getAttribLocation(
      INSTANCED_OFFSET_MODEL_MATRIX,
    )
    const identityMat = mat4.create()
    const itemsPerInstance = 16
    const bytesPerMatrix = itemsPerInstance * 4
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

    this.instanceAttributes.set(INSTANCED_OFFSET_MODEL_MATRIX, {
      location: instanceMatrixLocation,
      typedArray: matrixData,
      buffer: matrixBuffer,
      size: 4,
      stride: 4 * itemsPerInstance,
      instancedDivisor: 1,
    })

    this.#instanceExtension = getExtension(gl, 'ANGLE_instanced_arrays')
  }
  setMatrixAt(index: number, matrix: Float32Array): void {
    const itemsPerInstance = 16
    const { buffer, typedArray } = this.instanceAttributes.get(
      INSTANCED_OFFSET_MODEL_MATRIX,
    )
    for (
      let n = index * itemsPerInstance, j = 0;
      n < index * itemsPerInstance + itemsPerInstance;
      n++
    ) {
      typedArray[n] = matrix[j]
      j++
    }
    this.vaoExtension.bindVertexArrayOES(this.vao)
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, buffer)
    this.#gl.bufferData(
      this.#gl.ARRAY_BUFFER,
      typedArray,
      this.#gl.DYNAMIC_DRAW,
    )

    this.vaoExtension.bindVertexArrayOES(null)
  }
  draw(): this {

    if (this.modelMatrixNeedsUpdate) {
      this.updateModelMatrix()
      this.modelMatrixNeedsUpdate = false
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
    this.program.unbind()
    this.vaoExtension.bindVertexArrayOES(null)
    return this
  }
}
