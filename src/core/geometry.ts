import { vec3, mat4 } from 'gl-matrix'

import type { WebGLContext } from '../ts-types'

import { createBuffer, createIndexBuffer } from '../utils/gl-utils'

import { INDEX_ATTRIB_NAME, POSITION_ATTRIB_NAME } from '../utils/gl-constants'

export default class Geometry {
  public attributes = new Map()
  public vertexCount = 0

  #gl
  #hasIndices = false

  constructor(gl: WebGLContext) {
    this.#gl = gl
  }

  addIndex({ typedArray }) {
    const { count, buffer } = createIndexBuffer(this.#gl, typedArray)
    this.#hasIndices = true
    this.vertexCount = count
    this.attributes.set(INDEX_ATTRIB_NAME, {
      typedArray,
      buffer,
    })
    return this
  }

  addAttribute(
    key,
    {
      typedArray,
      size = 1,
      type = this.#gl.FLOAT,
      normalized = false,
      stride = 0,
      offset = 0,
      instancedDivisor,
    },
  ) {
    const buffer = createBuffer(this.#gl, typedArray)

    if (key === POSITION_ATTRIB_NAME && !this.vertexCount) {
      this.vertexCount = typedArray.length / size
    }

    this.attributes.set(key, {
      typedArray,
      size,
      type,
      normalized,
      stride,
      offset,
      buffer,
      instancedDivisor,
    })
    return this
  }

  delete() {
    this.attributes.forEach(({ buffer }) => {
      this.#gl.deleteBuffer(buffer)
    })
  }
}
