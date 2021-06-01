import { Texture, TextureInterface } from './texture'

export class CubeTexture extends Texture {
  #targets = [
    this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
    this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
    this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
  ]

  constructor(
    gl: WebGLRenderingContext,
    {
      format = gl.RGB,
      internalFormat = format,
      type = gl.UNSIGNED_BYTE,
      unpackAlignment = 1,
      wrapS = gl.CLAMP_TO_EDGE,
      wrapT = gl.CLAMP_TO_EDGE,
      minFilter = gl.LINEAR,
      magFilter = gl.LINEAR,
    }: TextureInterface = {},
  ) {
    super(gl, {
      format,
      internalFormat,
      type,
      unpackAlignment,
      wrapS,
      wrapT,
      minFilter,
      magFilter,
      target: gl.TEXTURE_CUBE_MAP,
    })
  }
  /**
   *
   * @param {Array.<HTMLImageElement | HTMLCanvasElement>} sidesImages
   * @returns {this}
   */
  addSides(sidesImages: Array<HTMLImageElement | HTMLCanvasElement>): this {
    const gl = this.gl

    sidesImages.forEach((image, i) => {
      const target = this.#targets[i]
      const level = 0
      gl.texImage2D(
        target,
        level,
        this.internalFormat,
        this.format,
        this.type,
        image,
      )
    })

    return this
  }
}
