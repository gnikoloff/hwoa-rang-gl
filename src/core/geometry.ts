import { createBuffer, createIndexBuffer } from '../utils/gl-utils'

import { INDEX_ATTRIB_NAME, POSITION_ATTRIB_NAME } from '../utils/gl-constants'
export default class Geometry {
  #gl: WebGLRenderingContext

  public attributes = new Map()
  public vertexCount = 0

  constructor(gl: WebGLRenderingContext) {
    this.#gl = gl
  }

  addIndex({ typedArray }: { typedArray: Uint32Array | Uint16Array }): this {
    const buffer = createIndexBuffer(this.#gl, typedArray)
    this.vertexCount = typedArray.length
    this.attributes.set(INDEX_ATTRIB_NAME, { typedArray, buffer })
    return this
  }

  addAttribute(
    key: string,
    {
      typedArray,
      size = 1,
      type = this.#gl.FLOAT,
      normalized = false,
      stride = 0,
      offset = 0,
      instancedDivisor,
    }: {
      typedArray: Float32Array | Float64Array
      size?: number
      type?: number
      normalized?: boolean
      stride?: number
      offset?: number
      instancedDivisor: number | null
    },
  ): this {
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

  delete(): void {
    this.attributes.forEach(({ buffer }) => {
      this.#gl.deleteBuffer(buffer)
    })
  }
}
