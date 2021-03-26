import { createBuffer, createIndexBuffer } from '../utils/gl-utils'

import { INDEX_ATTRIB_NAME, POSITION_ATTRIB_NAME } from '../utils/gl-constants'

import {
  WebGLElementBufferInterface,
  WebGLArrayBufferInterface,
} from '../types'

/**
 * Geometry class to hold buffers and attributes for a mesh.
 * Accepts the data that makes up your model - indices, vertices, uvs, normals, etc.
 * The only required attribute & buffer to render is "position"
 *
 * @public
 */
export class Geometry {
  #gl: WebGLRenderingContext

  public attributes = new Map()
  public vertexCount = 0

  constructor(gl: WebGLRenderingContext) {
    this.#gl = gl
  }

  /**
   * @description Set data into element array buffer
   * @param {WebGLElementBufferInterface} params
   * @returns {this}
   */
  addIndex(params: WebGLElementBufferInterface): this {
    const { typedArray } = params
    const buffer = createIndexBuffer(this.#gl, typedArray)
    this.vertexCount = typedArray.length
    this.attributes.set(INDEX_ATTRIB_NAME, { typedArray, buffer })
    return this
  }

  /**
   * @description Add attribute as array buffer
   * @param {string} key - Name of attribute. Must match attribute name in your GLSL program
   * @param {WebGLArrayBufferInterface} params
   * @returns {this}
   */
  addAttribute(key: string, params: WebGLArrayBufferInterface): this {
    const {
      typedArray,
      size = 1,
      type = this.#gl.FLOAT,
      normalized = false,
      stride = 0,
      offset = 0,
      instancedDivisor,
    } = params

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

  /**
   * @description Delete all buffers associated with this geometry
   */
  delete(): void {
    this.attributes.forEach(({ buffer }) => {
      this.#gl.deleteBuffer(buffer)
    })
  }
}
