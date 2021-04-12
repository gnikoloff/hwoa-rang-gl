import type { FramebufferInterface } from '../types'

import { Texture } from './texture'

export class Framebuffer {
  #gl!: WebGLRenderingContext
  #buffer!: WebGLFramebuffer
  #depthBuffer!: WebGLRenderbuffer

  #width: number
  #height: number
  #depth: boolean

  texture: Texture

  constructor(
    gl: WebGLRenderingContext,
    {
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
    }: FramebufferInterface = {},
  ) {
    this.#gl = gl
    this.#width = width
    this.#height = height
    this.#depth = depth

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

    this.#buffer = gl.createFramebuffer()!

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
    this.#gl.deleteFramebuffer(this.#buffer)
  }
}
