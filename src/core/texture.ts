import type { WebGLContext } from '../ts-types'

import { getExtension } from '../utils/gl-utils'

function isPowerOf2 (value: number) {
	return (value & (value - 1)) === 0
}

export default class Texture {
  #texture
  #gl
  constructor(gl: WebGLContext, {
    image = null,
    width,
    height,
    format = gl.RGB,
    internalFormat = format,
    type = gl.UNSIGNED_BYTE,
    isFlip = false,
    useMipmaps = false,
    wrapS = gl.CLAMP_TO_EDGE,
    wrapT = gl.CLAMP_TO_EDGE,
    anisotropy = 0,
  }) {
    this.#gl = gl
    this.#texture = gl.createTexture()

    gl.bindTexture(gl.TEXTURE_2D, this.#texture)
    
    if (image) {
      gl.texImage2D(gl.TEXTURE_2D, 0, format, format, type, image)


      if (isPowerOf2(image.width) && isPowerOf2(image.height) && useMipmaps) {
        gl.generateMipmap(gl.TEXTURE_2D)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      }

    } else if (width && height) {
      gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, type, null)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    }

    if (anisotropy) {
      gl.texParameterf(
        gl.TEXTURE_2D,
        (<any>getExtension(gl, 'EXT_texture_filter_anisotropic')).TEXTURE_MAX_ANISOTROPY_EXT,
        anisotropy
      )
    }

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT)

    gl.bindTexture(gl.TEXTURE_2D, null)
  }

  public getTexture () {
    return this.#texture
  }

  public bind () {
    this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.#texture)
  }

  public unbind () {
    this.#gl.bindTexture(this.#gl.TEXTURE_2D, null)
  }

}
