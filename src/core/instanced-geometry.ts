import { mat4 } from 'gl-matrix'

import type { WebGLContext } from '../ts-types'

import Geometry from './geometry'

import { createBuffer, getExtension } from '../utils/gl-utils'

export default class InstancedGeometry extends Geometry {
  #instancedExtension
  #gl
  #instanceCount
  #instanceMatricesArr
  #instanceMatricesBuffer
  #instanceMatricesTypedArray
  #initedOnGPU = false

  constructor (gl: WebGLContext) {
    super(gl)

    this.#gl = gl

    this.#instancedExtension = getExtension(gl, 'ANGLE_instanced_arrays')
  }

  set instanceCount (count: number) {
    this.#instanceCount = count

    const itemsPerInstance = 16
    
    const matrixData = new Float32Array(count * itemsPerInstance)

    const emptyMat = mat4.create()

    for (let i = 0; i < count; i++) {
      for (let n = i * itemsPerInstance, j = 0; n < i * itemsPerInstance + itemsPerInstance; n++) {
        matrixData[n] = emptyMat[j]
        j++
      }
    }
  

    const matrixBuffer = this.#gl.createBuffer()
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, matrixBuffer)
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, matrixData, this.#gl.DYNAMIC_DRAW)

    this.#instanceMatricesBuffer = matrixBuffer
    this.#instanceMatricesTypedArray = matrixData

    // (<any>getExtension(this.#gl, 'GMAN_debug_helper')).tagObject(this.#instanceMatricesBuffer, 'mybyffer')
  }

  setMatrixAt (idx, modelMatrix, {
    location = -1,
    size = 4,
    type = this.#gl.FLOAT,
    normalized = false,
    stride = 64,
  } = {}) {
    if (!this.#instanceCount) {
      console.error(`
        Instance count not specified!
        Please set instanceCount before calling updateMatrixAt()
      `)
    }

    const itemsPerInstance = 16

    for (let n = idx * itemsPerInstance, j = 0; n < idx * itemsPerInstance + itemsPerInstance; n++) {
      this.#instanceMatricesTypedArray[n] = modelMatrix[j]
      j++
    }

    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#instanceMatricesBuffer)
    // TODO; use bufferSubData instead
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, this.#instanceMatricesTypedArray, this.#gl.STATIC_DRAW)
    
    if (!this.#initedOnGPU) {
      const bytesPerMatrix = 4 * 16;
      for (let i = 0; i < 4; ++i) {
        const loc = location + i
        this.#gl.enableVertexAttribArray(loc)
        // note the stride and offset
        const offset = i * 16  // 4 floats per row, 4 bytes per float
        this.#gl.vertexAttribPointer(
          loc,              // location
          4,                // size (num values to pull from buffer per iteration)
          this.#gl.FLOAT,         // type of data in buffer
          false,            // normalize
          bytesPerMatrix,   // stride, num bytes to advance to get to next set of values
          offset,           // offset in buffer
        )
        this.#gl.vertexAttribDivisor(loc, 1)
      }
      this.#initedOnGPU = true
    }

    this.attributes.set('offsetModelMatrix', {
      modelMatrix,
      size,
      type,
      normalized,
      stride,
    })
    return this
    
  }

  addInstancedAttribute (key, {
    typedArray,
    location,
    size = 1,
    type = this.#gl.FLOAT,
    normalized = false,
    stride = 0,
    offset = 0,
    instancedDivisor = 1,
  }) {
    const buffer = createBuffer(this.#gl, typedArray)
    this.#gl.vertexAttribPointer(location, size, type, normalized, stride, offset)
    this.#gl.enableVertexAttribArray(location)
    if (this.#gl instanceof WebGL2RenderingContext) {
      this.#gl.vertexAttribDivisor(location, 1)
    } else {
      this.#instancedExtension.vertexAttribDivisorANGLE(location, instancedDivisor)
    }
    this.attributes.set(key, {
      typedArray,
      location,
      size,
      type,
      normalized,
      stride,
      offset,
      buffer
    })
    return this
  }

  draw () {
    if (this.#gl instanceof WebGL2RenderingContext) {
      this.#gl.drawElementsInstanced(
        this.drawMode,
        this.vertexCount,
        this.#gl.UNSIGNED_SHORT,
        0,
        this.#instanceCount
      )
    } else {
      this.#instancedExtension.drawElementsInstancedANGLE(
        this.drawMode,
        this.vertexCount,
        this.#gl.UNSIGNED_SHORT,
        0,
        this.#instanceCount
      )
    }
    return this
  }

}
