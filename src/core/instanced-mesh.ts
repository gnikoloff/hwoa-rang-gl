import { mat4 } from 'gl-matrix'

import Mesh from './mesh'

import { INSTANCED_OFFSET_MODEL_MATRIX, } from '../utils/gl-constants'
import { getExtension } from '../utils/gl-utils'

export default class InstancedMesh extends Mesh {
  public instanceCount
  public instanceAttributes = new Map()

  #geometry
  #gl
  #instanceExtension

  constructor (gl, geometry, {
    instanceCount = 1,
    vertexShaderSource,
    fragmentShaderSource,
  }: any = {}) {
    super(gl, geometry, { vertexShaderSource, fragmentShaderSource })

    this.#gl = gl
    this.#geometry = geometry

    this.instanceCount = instanceCount

    const instanceMatrixLocation = this.program.getAttribLocation(INSTANCED_OFFSET_MODEL_MATRIX)
    const identityMat = mat4.create()
    const itemsPerInstance = 16
    const bytesPerMatrix = itemsPerInstance * 4
    const matrixData = new Float32Array(itemsPerInstance * instanceCount)
    
    for (let i = 0; i < instanceCount; i++) {
      for (let n = i * itemsPerInstance, j = 0; n < i * itemsPerInstance + itemsPerInstance; n++) {
        matrixData[n] = identityMat[j]
        j++
      }
    }

    this.vao.bind()
    const matrixBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, matrixData, gl.DYNAMIC_DRAW)
    for (let i = 0; i < 4; i++) {
      const location = instanceMatrixLocation + i
      gl.enableVertexAttribArray(location)
      const offset = i * itemsPerInstance
      gl.vertexAttribPointer(location, 4, gl.FLOAT, false, bytesPerMatrix, offset)

      if (gl instanceof WebGL2RenderingContext) {
        gl.vertexAttribDivisor(location, 1)
      } else {

        // ...
      }
    }
    this.vao.unbind()

    this.instanceAttributes.set(INSTANCED_OFFSET_MODEL_MATRIX, {
      location: instanceMatrixLocation,
      typedArray: matrixData,
      buffer: matrixBuffer,
      size: 4,
      stride: 4 * itemsPerInstance,
      instancedDivisor: 1
    })

    if (gl instanceof WebGLRenderingContext) {
      this.#instanceExtension = getExtension(gl, 'ANGLE_instanced_arrays')
    }
    
  }
  setMatrixAt (index, matrix) {
    const itemsPerInstance = 16
    const {
      buffer,
      typedArray
    } = this.instanceAttributes.get(INSTANCED_OFFSET_MODEL_MATRIX)
    for (let n = index * itemsPerInstance, j = 0; n < index * itemsPerInstance + itemsPerInstance; n++) {
      typedArray[n] = matrix[j]
      j++
    }
    this.vao.bind()
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, buffer)
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, typedArray, this.#gl.DYNAMIC_DRAW)

    this.vao.unbind()
  }
  draw () {
    this.program.bind()
    this.vao.bind()
    if (this.#gl instanceof WebGL2RenderingContext) {
      if (this.hasIndices) {
        this.#gl.drawElementsInstanced(
          this.drawMode,
          this.#geometry.vertexCount,
          this.#gl.UNSIGNED_SHORT,
          0,
          this.instanceCount
        )
      } else {
        this.#gl.drawArraysInstanced(
          this.drawMode,
          0,
          this.#geometry.vertexCount,
          this.instanceCount
        )
      }
    } else {
      if (this.hasIndices) {
        this.#instanceExtension.drawElementsInstancedANGLE(
          this.drawMode,
          this.#geometry.vertexCount,
          this.#gl.UNSIGNED_SHORT,
          0,
          this.instanceCount
        )  
      } else {
        this.#gl.drawArraysInstancedANGLE(
          this.drawMode,
          0,
          this.#geometry.vertexCount,
          this.instanceCount
        )
      }
    }
    this.program.unbind()
    this.vao.unbind()
    return this
  }
}
