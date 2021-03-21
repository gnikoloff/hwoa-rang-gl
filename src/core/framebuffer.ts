import type { RenderTargetInterface } from '../ts-types'

import Texture from './texture'

export default class Framebuffer {
  #gl: WebGLRenderingContext
  #buffer: WebGLFramebuffer
  #depthBuffer: WebGLRenderbuffer

  #width: number
  #height: number

  texture: Texture

  constructor(
    gl: WebGLRenderingContext,
    {
      width = gl.canvas.width,
      height = gl.canvas.height,
      target = gl.FRAMEBUFFER,
      wrapS = gl.CLAMP_TO_EDGE,
      wrapT = gl.CLAMP_TO_EDGE,
      format = gl.RGBA,
      internalFormat = format,
      depth = true,
    }: RenderTargetInterface,
  ) {
    this.#gl = gl
    this.#width = width
    this.#height = height

    this.texture = new Texture(gl, {
      format,
      internalFormat,
      wrapS,
      wrapT,
    })

    this.texture.bind().fromSize(width, height).unbind()

    this.#buffer = gl.createFramebuffer()

    gl.bindFramebuffer(target, this.#buffer)

    const level = 0
    const texture = this.texture.getTexture()
    gl.framebufferTexture2D(
      target,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      level,
    )

    if (depth) {
      this.#depthBuffer = this.#gl.createRenderbuffer()
      this.#gl.bindRenderbuffer(this.#gl.RENDERBUFFER, this.#depthBuffer)
      this.#gl.renderbufferStorage(
        this.#gl.RENDERBUFFER,
        this.#gl.DEPTH_COMPONENT16,
        this.#width,
        this.#height,
      )
      this.#gl.framebufferRenderbuffer(
        target,
        this.#gl.DEPTH_ATTACHMENT,
        this.#gl.RENDERBUFFER,
        this.#depthBuffer,
      )
    }

    gl.bindFramebuffer(target, null)
  }
  bind(): this {
    this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, this.#buffer)
    return this
  }
  unbind(): this {
    this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null)
    return this
  }
  /**
   * @description reset texture
   */
  reset() {
    this.texture.bind().fromSize(this.#width, this.#height)
  }
  delete() {
    this.texture.delete()
    this.#gl.deleteFramebuffer(this.#buffer)
  }
}
