import { getExtension } from '../utils/gl-utils'
import { Texture } from './texture'

interface FramebufferOptions {
  /**
   * @default gl.canvas.width
   */
  width?: number
  /**
   * @default gl.canvas.height
   */
  height?: number
  /**
   * @default gl.CLAMP_TO_EDGE
   */
  wrapS?: GLenum
  /**
   * @default gl.CLAMP_TO_EDGE
   */
  wrapT?: GLenum
  /**
   * @default gl.NEAREST
   */
  minFilter?: GLenum
  /**
   * @default gl.NEAREST
   */
  magFilter?: GLenum
  /**
   * @default gl.RGBA
   */
  format?: GLenum
  /**
   * @default gl.UNSIGNED_BYTE
   */
  type?: GLenum
  /**
   * @default gl.RGBA
   */
  internalFormat?: GLenum
  /**
   * @default true
   */
  depth?: boolean
  /**
   * @description Controls wether to use depth texture using WEBGL_depth_texture extension or regular renderbuffer
   * @default true
   */
  useDepthRenderBuffer?: boolean
  /**
   * @description Optional input texture, otherwise a new empty one will be generated
   */
  inputTexture?: Texture
}

let _supportsRenderToFloatingPointTexture: boolean | null = null
let _supportsRenderToHalfFloatingPointTexture: boolean | null = null

export class Framebuffer {
  #gl: WebGLRenderingContext
  #buffer: WebGLFramebuffer | null
  #depthBuffer?: WebGLRenderbuffer | null

  #width: number
  #height: number
  #depth: boolean
  #useDepthRenderBuffer: boolean

  texture: Texture
  depthTexture?: Texture

  static supportRenderingToFloat(gl) {
    if (_supportsRenderToFloatingPointTexture !== null) {
      return _supportsRenderToFloatingPointTexture
    }
    getExtension(gl, 'OES_texture_float')

    const texture = new Texture(gl, {
      format: gl.RGBA,
      type: gl.FLOAT,
    })
      .bind()
      .fromSize(1, 1)

    const framebuffer = new Framebuffer(gl, {
      depth: false,
      inputTexture: texture,
    }).bind()

    const framebufferStatus = framebuffer.checkCompleteness()

    framebuffer.unbind()

    _supportsRenderToFloatingPointTexture =
      framebufferStatus === gl.FRAMEBUFFER_COMPLETE
    return _supportsRenderToFloatingPointTexture
  }

  static supportRenderingToHalfFloat(gl) {
    if (_supportsRenderToHalfFloatingPointTexture !== null) {
      return _supportsRenderToHalfFloatingPointTexture
    }
    const ext = getExtension(gl, 'OES_texture_half_float')

    const texture = new Texture(gl, {
      format: gl.RGBA,
      type: ext.HALF_FLOAT_OES,
    })
      .bind()
      .fromSize(1, 1)

    const framebuffer = new Framebuffer(gl, {
      depth: false,
      inputTexture: texture,
    }).bind()

    const framebufferStatus = framebuffer.checkCompleteness()

    framebuffer.unbind()

    _supportsRenderToHalfFloatingPointTexture =
      framebufferStatus === gl.FRAMEBUFFER_COMPLETE
    return _supportsRenderToHalfFloatingPointTexture
  }

  constructor(gl: WebGLRenderingContext, params: FramebufferOptions = {}) {
    const {
      inputTexture,
      width = gl.canvas.width,
      height = gl.canvas.height,
      wrapS = gl.CLAMP_TO_EDGE,
      wrapT = gl.CLAMP_TO_EDGE,
      minFilter = gl.NEAREST,
      magFilter = gl.NEAREST,
      format = gl.RGBA,
      internalFormat = format,
      type = gl.UNSIGNED_BYTE,
      depth = true,
      useDepthRenderBuffer = true,
    } = params

    this.#gl = gl
    this.#width = width
    this.#height = height
    this.#depth = depth
    this.#useDepthRenderBuffer = useDepthRenderBuffer

    if (inputTexture) {
      this.texture = inputTexture
    } else {
      this.texture = new Texture(gl, {
        type,
        format,
        internalFormat,
        wrapS,
        wrapT,
        minFilter,
        magFilter,
      })
        .bind()
        .fromSize(width, height)
    }

    this.#buffer = gl.createFramebuffer()

    this.updateWithSize(this.#width, this.#height)
  }

  bind(): this {
    this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, this.#buffer)
    return this
  }

  unbind(): this {
    this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null)
    return this
  }

  checkCompleteness() {
    return this.#gl.checkFramebufferStatus(this.#gl.FRAMEBUFFER)
  }

  updateWithSize(width: number, height: number, updateTexture = false): this {
    this.bind()
    const level = 0
    const texture = this.texture.getTexture()
    this.#gl.framebufferTexture2D(
      this.#gl.FRAMEBUFFER,
      this.#gl.COLOR_ATTACHMENT0,
      this.#gl.TEXTURE_2D,
      texture,
      level,
    )

    if (this.#depth) {
      if (this.#useDepthRenderBuffer) {
        this.#depthBuffer = this.#gl.createRenderbuffer()!
        this.#gl.bindRenderbuffer(this.#gl.RENDERBUFFER, this.#depthBuffer)
        this.#gl.renderbufferStorage(
          this.#gl.RENDERBUFFER,
          this.#gl.DEPTH_COMPONENT16,
          width,
          height,
        )
        this.#gl.framebufferRenderbuffer(
          this.#gl.FRAMEBUFFER,
          this.#gl.DEPTH_ATTACHMENT,
          this.#gl.RENDERBUFFER,
          this.#depthBuffer,
        )
        this.#gl.bindRenderbuffer(this.#gl.RENDERBUFFER, null)
      } else {
        const depthTextureExt = getExtension(this.#gl, 'WEBGL_depth_texture')
        if (!depthTextureExt) {
          console.error('Missing extension WEBGL_depth_texture')
        }
        this.depthTexture = new Texture(this.#gl, {
          format: this.#gl.DEPTH_COMPONENT,
          type: this.#gl.UNSIGNED_INT,
          minFilter: this.#gl.LINEAR,
          magFilter: this.#gl.LINEAR,
        })
          .bind()
          .fromSize(this.#width, this.#height)
        this.#gl.framebufferTexture2D(
          this.#gl.FRAMEBUFFER,
          this.#gl.DEPTH_ATTACHMENT,
          this.#gl.TEXTURE_2D,
          this.depthTexture.getTexture(),
          0,
        )
      }
    }
    this.unbind()

    if (updateTexture) {
      this.texture.bind().fromSize(width, height)
    }

    this.#width = width
    this.#height = height
    return this
  }

  reset(): this {
    this.texture
      .bind()
      .fromSize(this.#width, this.#height)
      .unbind()
    return this
  }
  delete(): void {
    this.texture.delete()
    if (this.depthTexture) {
      this.depthTexture.delete()
    }
    this.#gl.deleteFramebuffer(this.#buffer)
  }
}
