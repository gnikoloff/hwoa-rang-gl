import { createBuffer, createIndexBuffer } from '../utils/gl-utils'

import { INDEX_ATTRIB_NAME, POSITION_ATTRIB_NAME } from '../utils/gl-constants'

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
   *
   * @param {string} key - Name of attribute. Must match attribute name in your GLSL program
   * @param {number} index - Index to start updating your typed array from
   * @param {number} size - How many items are to be updated
   * @param {Float32Array} subTypeArray - The whole or partial array to update your attribute with
   * @returns {this}
   */
  updateAttribute(
    key: string,
    index: number,
    size: number,
    subTypeArray: Float32Array,
  ): this {
    const foundAttrib = this.attributes.get(key)
    if (!foundAttrib) {
      console.error('Could not locate an attribute to update')
    }

    const { buffer } = foundAttrib

    // TODO: Move updating buffer to a helper method
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, buffer)
    this.#gl.bufferSubData(
      this.#gl.ARRAY_BUFFER,
      index * size * Float32Array.BYTES_PER_ELEMENT,
      subTypeArray,
    )

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

interface WebGLElementBufferInterface {
  /**
   * Indices as typed array
   */
  typedArray: Uint32Array | Uint16Array
}

interface WebGLArrayBufferInterface {
  /**
   * Data as typed array
   */
  typedArray: Float32Array | Float64Array
  /**
   * @defaultValue 1
   */
  size?: number
  /**
   * @defaultValue 1
   */
  type?: number
  /**
   * @defaultValue false
   */
  normalized?: boolean
  /**
   * @defaultValue 0
   */
  stride?: number
  /**
   * @defaultValue 1
   */
  offset?: number
  instancedDivisor?: number
}
