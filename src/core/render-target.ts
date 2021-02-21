import type { RenderTargetInterface } from '../ts-types'

import Texture from './texture'

export default class RenderTarget {
  #gl
  #buffer
  #depthBuffer
  #textures = []

  public width
  public height

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
    this.width = width
    this.height = height

    const tex = new Texture(gl, {
      width,
      height,
      wrapS,
      wrapT,
      format,
      internalFormat,
    })

    this.#textures.push(tex)

    this.#buffer = gl.createFramebuffer()

    gl.bindFramebuffer(target, this.#buffer)

    const level = 0
    const texture = tex.getTexture()
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
        width,
        height,
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
  bindTexture(): this {
    this.#textures[0].bind()
    return this
  }
  unbindTexture(): this {
    this.#textures[0].unbind()
    return this
  }
}
