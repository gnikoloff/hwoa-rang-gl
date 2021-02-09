import type { WebGLContext } from '../ts-types'

function isPowerOf2 (value: number) {
	return (value & (value - 1)) === 0
}

export default class Texture {
  #texture
  #gl
  constructor(gl: WebGLContext, {
    image,
    format = gl.RGB,
    type,
    isFlip = false,
    useMipmaps = false,
    wrapS = gl.CLAMP_TO_EDGE,
    wrapT = gl.CLAMP_TO_EDGE
  }) {
    this.#gl = gl
    this.#texture = gl.createTexture()

    gl.bindTexture(gl.TEXTURE_2D, this.#texture)

    // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, isFlip ? 0 : 1)
    gl.texImage2D(gl.TEXTURE_2D, 0, format, format, type, image)

    if (isPowerOf2(image.width) && isPowerOf2(image.height) && useMipmaps) {
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    }

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT)

    gl.bindTexture(gl.TEXTURE_2D, null)
  }

  bind () {
    this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.#texture)
  }

  unbind () {
    this.#gl.bindTexture(this.#gl.TEXTURE_2D, null)
  }

}
