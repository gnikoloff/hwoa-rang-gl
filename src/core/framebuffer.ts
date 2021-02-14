import { WebGLContext } from '../ts-types'

import Texture from './texture'

export default class Framebuffer {
  public width
  public height
  #gl
  #buffer
  #textures = []
  constructor (gl, {
    width = gl.canvas.width,
    height = gl.canvas.height,
    target = gl.FRAMEBUFFER,
    wrapS = gl.CLAMP_TO_EDGE,
    wrapT = gl.CLAMP_TO_EDGE,
    type = gl.UNSIGNED_BYTE,
    format = gl.RGBA,
    internalFormat = format,

  }) {
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
    gl.framebufferTexture2D(target, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, level)
    
    gl.bindFramebuffer(target, null)
  }
  bind () {
    this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, this.#buffer)
  }
  unbind () {
    this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null)
  }
  bindTexture () {
    this.#textures[0].bind()
  }
  unbindTexture () {
    this.#textures[0].unbind()
  }
}
