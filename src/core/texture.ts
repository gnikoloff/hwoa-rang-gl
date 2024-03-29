import { getExtension } from '../utils/gl-utils'
import { isPowerOf2 } from '../utils/math'

/**
 * Texture class used to store image, video, canvas and data as typed arrays
 * @public
 */
export class Texture {
  protected gl!: WebGLRenderingContext
  protected texture!: WebGLTexture | null

  protected width!: number
  protected height!: number
  protected format: number
  protected internalFormat: number
  protected type: number
  protected anisotropyExtension: EXT_texture_filter_anisotropic
  protected target: number

  static isPowerOf2 = (width: number, height: number): boolean =>
    isPowerOf2(width) && isPowerOf2(height)

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
      target = gl.TEXTURE_2D,
    }: TextureInterface = {},
  ) {
    this.gl = gl
    this.format = format
    this.internalFormat = internalFormat
    this.type = type
    this.target = target

    this.texture = gl.createTexture()

    this.bind()
      .setPixelStore(gl.UNPACK_ALIGNMENT, unpackAlignment)
      .setMinFilter(minFilter)
      .setMagFilter(magFilter)
      .setWrap(wrapS, wrapT)
      .unbind()

    this.anisotropyExtension =
      getExtension(gl, 'EXT_texture_filter_anisotropic') ||
      getExtension(gl, 'MOZ_EXT_texture_filter_anisotropic') ||
      getExtension(gl, 'WEBKIT_EXT_texture_filter_anisotropic')
  }

  /**
   * @returns {WebGLTexture|null}
   */
  getTexture(): WebGLTexture | null {
    return this.texture
  }

  /**
   * Binds the texture to the target
   * @returns {this}
   */
  bind(): this {
    this.gl.bindTexture(this.target, this.texture)
    return this
  }

  /**
   * Unbinds the texture
   * @returns {this}
   */
  unbind(): this {
    this.gl.bindTexture(this.target, null)
    return this
  }

  /**
   * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} image
   * @param {number} [width]
   * @param {number} [height
   * @returns {this}
   */
  fromImage(
    image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    width = image.width,
    height = image.height,
  ): this {
    this.width = width
    this.height = height

    this.gl.texImage2D(
      this.target,
      0,
      this.internalFormat,
      this.format,
      this.type,
      image,
    )
    return this
  }

  /**
   * @param {number} width
   * @param {number} height
   * @returns {this}
   */
  fromSize(width: number, height: number): this {
    if (!width || !height) {
      console.warn('Incomplete dimensions for creating empty texture')
    }
    this.width = width
    this.height = height
    this.gl.texImage2D(
      this.target,
      0,
      this.internalFormat,
      this.width,
      this.height,
      0,
      this.format,
      this.type,
      null,
    )

    return this
  }

  /**
   * @param dataArray
   * @param {number} [width]
   * @param {number} [height]
   * @returns {this}
   */
  fromData(dataArray, width: number, height: number): this {
    if (!width || !height) {
      console.warn('Incomplete dimensions for creating texture from data array')
    }
    this.width = width
    this.height = height

    this.gl.texImage2D(
      this.target,
      0,
      this.internalFormat,
      this.width,
      this.height,
      0,
      this.format,
      this.type,
      dataArray,
    )
    return this
  }

  /**
   * @returns {this}
   */
  generateMipmap(): this {
    this.gl.generateMipmap(this.target)
    return this
  }

  /**
   * @param {GLEnum} [format = gl.RGB]
   * @param {GLEnum} [internalFormat = gl.RGB]
   * @param {GLenum} [type = gl.UNSIGNED_BYTE]
   * @returns {this}
   */
  setFormat(
    format = this.gl.RGB,
    internalFormat = this.gl.RGB,
    type = this.gl.UNSIGNED_BYTE,
  ): this {
    this.format = format
    this.internalFormat = internalFormat
    this.type = type
    return this
  }

  /**
   * @returns {this}
   */
  setIsFlip(flip = 1): this {
    this.setPixelStore(this.gl.UNPACK_FLIP_Y_WEBGL, flip)
    return this
  }

  /**
   * @param {GLenum} name
   * @param params
   * @returns {this}
   */
  setPixelStore(name: GLenum, params: GLenum): this {
    this.gl.pixelStorei(name, params)
    return this
  }

  /**
   * @param {GLenum} [filter = gl.LINEAR]
   * @returns {this}
   */
  setMinFilter(filter = this.gl.LINEAR): this {
    this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, filter)
    return this
  }

  /**
   * @param {GLenum} [filter = gl.LINEAR]
   * @returns {this}
   */
  setMagFilter(filter = this.gl.LINEAR): this {
    this.gl.texParameteri(this.target, this.gl.TEXTURE_MAG_FILTER, filter)
    return this
  }

  /**
   *
   * @param {GLenum} [wrapS = gl.CLAMP_TO_EDGE]
   * @param {GLenum} [wrapT = gl.CLAMP_TO_EDGE]
   * @returns {this}
   */
  setWrap(wrapS = this.gl.CLAMP_TO_EDGE, wrapT = this.gl.CLAMP_TO_EDGE): this {
    this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_S, wrapS)
    this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_T, wrapT)
    return this
  }

  /**
   *
   * @param {number} anisotropyLevel
   * @returns {this}
   */
  setAnisotropy(anisotropyLevel: number): this {
    if (!anisotropyLevel) {
      return this
    }
    if (this.anisotropyExtension) {
      const maxAnisotropySupported = this.gl.getParameter(
        this.anisotropyExtension.MAX_TEXTURE_MAX_ANISOTROPY_EXT,
      )
      this.gl.texParameterf(
        this.target,
        this.anisotropyExtension.TEXTURE_MAX_ANISOTROPY_EXT,
        anisotropyLevel || maxAnisotropySupported,
      )
    } else {
      console.warn('EXT_texture_filter_anisotropic extension is not supported')
    }
    return this
  }

  delete(): void {
    this.gl.deleteTexture(this.texture)
  }
}

// format = gl.RGB,
//       internalFormat = format,
//       type = gl.UNSIGNED_BYTE,
//       unpackAlignment = 1,
//       wrapS = gl.CLAMP_TO_EDGE,
//       wrapT = gl.CLAMP_TO_EDGE,
//       minFilter = gl.LINEAR,
//       magFilter = gl.LINEAR,

export interface TextureInterface {
  /**
   * @default gl.RGB
   */
  format?: GLenum
  /**
   * @default gl.RGB
   */
  internalFormat?: GLenum
  /**
   * @default gl.UNSIGNED_BYTE
   */
  type?: GLenum
  /**
   * @default 1
   */
  unpackAlignment?: number
  /**
   * @default gl.CLAMP_TO_EDGE
   */
  wrapS?: GLenum
  /**
   * @default gl.CLAMP_TO_EDGE
   */
  wrapT?: GLenum
  /**
   * @default gl.LINEAR
   */
  minFilter?: GLenum
  /**
   * @default gl.LINEAR
   */
  magFilter?: GLenum
  /**
   * @default gl.TEXTURE_2D
   */
  target?: GLenum
}
