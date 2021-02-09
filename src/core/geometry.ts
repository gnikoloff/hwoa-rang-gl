import type { WebGLContext } from '../ts-types'

import VAO from './vao'
import { createBuffer, createIndexBuffer, getExtension } from '../utils/gl-utils'

export default class Geometry {
  public attributes = new Map()
  public vertexCount = 0

  #gl
  #vao
  #instanceCount = -1
  #hasIndices = false
  #vertexCount: number
  #instancedExtension

  constructor(gl: WebGLContext) {
    this.#gl = gl
    this.#vao = new VAO(gl)

    this.#instancedExtension = getExtension(gl, 'ANGLE_instanced_arrays')
  }

  set instanceCount (count: number) {
    this.#instanceCount = count
  }

  bind () {
    this.#vao.bind()
    return this
  }

  unbind () {
    this.#vao.unbind()
    return this
  }

  draw () {
    if (this.#hasIndices) {
      if (this.#instanceCount !== -1) {
        if (this.#gl.isWebGL2) {
          this.#gl.drawElementsInstanced(
            this.#gl.TRIANGLES,
            this.#vertexCount,
            this.#gl.UNSIGNED_SHORT,
            0,
            this.#instanceCount
          )
        } else {
          this.#instancedExtension.drawElementsInstancedANGLE(
            this.#gl.TRIANGLES,
            this.#vertexCount,
            this.#gl.UNSIGNED_SHORT,
            0,
            this.#instanceCount
          )
        }
      } else {
        this.#gl.drawElements(
          this.#gl.TRIANGLES,
          this.#vertexCount,
          this.#gl.UNSIGNED_SHORT,
          0
        )
      }
    } else {
      // drawArrays
    }
    return this
  }

  addIndex ({ typedArray }) {
    const { count, buffer } = createIndexBuffer(this.#gl, typedArray)
    this.#hasIndices = true
    this.#vertexCount = count
    this.attributes.set('index', {
      typedArray,
      buffer,
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
    if (this.#gl.isWebGL2) {
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

  addAttribute (key, {
    typedArray,
    location,
    size = 1,
    type = this.#gl.FLOAT,
    normalized = false,
    stride = 0,
    offset = 0,
  }) {
    const buffer = createBuffer(this.#gl, typedArray)
    this.#gl.vertexAttribPointer(location, size, type, normalized, stride, offset)
    this.#gl.enableVertexAttribArray(location)
      
    if (key === 'position' && !this.#vertexCount) {
      this.#vertexCount = typedArray.length / typedArray.size
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

  delete () {
    this.attributes.forEach(({ buffer }) => {
      this.#gl.deleteBuffer(buffer)
    })
    this.#vao.delete()
  }

}