import { getExtension } from '../utils/gl-utils'

const isPowerOf2 = (value: number) => (value & (value - 1)) === 0

export default class Texture {
  #gl: WebGLRenderingContext
  #texture: WebGLTexture

  #width: number
  #height: number
  #format: number
  #internalFormat: number
  #type: number
  #anisotropyExtension: EXT_texture_filter_anisotropic

  static isPowerOf2 = (width, height) => isPowerOf2(width) && isPowerOf2(height)

  constructor(
    gl: WebGLRenderingContext,
    {
      format = gl.RGB,
      internalFormat = format,
      type = gl.UNSIGNED_BYTE,
      unpackAlignment = 1,
      wrapS = gl.CLAMP_TO_EDGE,
      wrapT = gl.CLAMP_TO_EDGE,
      minFilter = gl.NEAREST,
      magFilter = gl.NEAREST,
    } = {},
  ) {
    this.#gl = gl
    this.#format = format
    this.#internalFormat = internalFormat
    this.#type = type

    this.#texture = gl.createTexture()

    this.bind()
      .setPixelStore(gl.UNPACK_ALIGNMENT, unpackAlignment)
      .setMinFilter(minFilter)
      .setMagFilter(magFilter)
      .setWrap(wrapS, wrapT)
      .unbind()

    this.#anisotropyExtension =
      getExtension(gl, 'EXT_texture_filter_anisotropic') ||
      getExtension(gl, 'MOZ_EXT_texture_filter_anisotropic') ||
      getExtension(gl, 'WEBKIT_EXT_texture_filter_anisotropic')
  }

  getTexture(): WebGLTexture {
    return this.#texture
  }

  bind() {
    this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.#texture)
    return this
  }

  unbind() {
    this.#gl.bindTexture(this.#gl.TEXTURE_2D, null)
    return this
  }

  fromImage(image, width = image.width, height = image.height): this {
    this.#width = width
    this.#height = height

    this.#gl.texImage2D(
      this.#gl.TEXTURE_2D,
      0,
      this.#internalFormat,
      this.#format,
      this.#type,
      image,
    )
    return this
  }

  fromSize(width, height): this {
    if (!width || !height) {
      console.warn('Incomplete dimensions for creating empty texture')
    }
    this.#width = width
    this.#height = height
    this.#gl.texImage2D(
      this.#gl.TEXTURE_2D,
      0,
      this.#internalFormat,
      this.#width,
      this.#height,
      0,
      this.#format,
      this.#type,
      null,
    )

    return this
  }

  fromData(dataArray, width, height): this {
    if (!width || !height) {
      console.warn('Incomplete dimensions for creating texture from data array')
    }
    this.#width = width
    this.#height = height

    this.#gl.texImage2D(
      this.#gl.TEXTURE_2D,
      0,
      this.#internalFormat,
      this.#width,
      this.#height,
      0,
      this.#format,
      this.#type,
      dataArray,
    )
    return this
  }

  generateMipmap(): this {
    this.#gl.generateMipmap(this.#gl.TEXTURE_2D)
    return this
  }

  setFormat(
    format = this.#gl.RGB,
    internalFormat = this.#gl.RGB,
    type = this.#gl.UNSIGNED_BYTE,
  ): this {
    this.#format = format
    this.#internalFormat = internalFormat
    this.#type = type
    return this
  }

  setIsFlip(): this {
    this.setPixelStore(this.#gl.UNPACK_FLIP_Y_WEBGL, true)
    return this
  }

  setPixelStore(name, params): this {
    this.#gl.pixelStorei(name, params)
    return this
  }

  setMinFilter(filter = this.#gl.LINEAR): this {
    console.log(filter === this.#gl.NEAREST)
    this.#gl.texParameteri(
      this.#gl.TEXTURE_2D,
      this.#gl.TEXTURE_MIN_FILTER,
      filter,
    )
    return this
  }

  setMagFilter(filter = this.#gl.LINEAR): this {
    this.#gl.texParameteri(
      this.#gl.TEXTURE_2D,
      this.#gl.TEXTURE_MAG_FILTER,
      filter,
    )
    return this
  }

  setWrap(
    wrapS = this.#gl.CLAMP_TO_EDGE,
    wrapT = this.#gl.CLAMP_TO_EDGE,
  ): this {
    this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_WRAP_S, wrapS)
    this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_WRAP_T, wrapT)
    return this
  }

  setAnisotropy(anisotropyLevel): this {
    if (!anisotropyLevel) {
      return
    }
    if (this.#anisotropyExtension) {
      const maxAnisotropySupported = this.#gl.getParameter(
        this.#anisotropyExtension.MAX_TEXTURE_MAX_ANISOTROPY_EXT,
      )
      this.#gl.texParameterf(
        this.#gl.TEXTURE_2D,
        this.#anisotropyExtension.TEXTURE_MAX_ANISOTROPY_EXT,
        anisotropyLevel || maxAnisotropySupported,
      )
    } else {
      console.warn('EXT_texture_filter_anisotropic extension is not supported')
    }
    return this
  }

  delete(): this {
    this.#gl.deleteTexture(this.#texture)
    return this
  }
}
