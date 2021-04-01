import { Framebuffer } from '../core/framebuffer'
import { Geometry } from '../core/geometry'
import { Mesh } from '../core/mesh'
import { getExtension } from '../utils/gl-utils'
import { createFullscreenQuad } from '../geometry-utils'
import { Texture } from '../core/texture'

export class SwapRenderer {
  #gl: WebGLRenderingContext

  #framebuffers = new Map()
  #programs = new Map()
  #textures = new Map()

  #activeProgram: Mesh

  constructor(gl) {
    this.#gl = gl

    const ext1 = getExtension(gl, 'OES_texture_float')

    if (!ext1) {
      // TODO: handle
    }
    const ext2 = getExtension(gl, 'WEBGL_color_buffer_float')
    if (!ext2) {
      // TODO: handle missing extension
    }
  }

  getTexture(name: string) {
    const texture = this.#textures.get(name)
    if (!texture) {
      // ...
    }
    return texture
  }

  createTexture(
    name: string,
    width: number,
    height: number,
    data: Float32Array | null,
  ) {
    const texture = new Texture(this.#gl, {
      type: this.#gl.FLOAT,
      format: this.#gl.RGBA,
    })
    texture.bind()
    if (data) {
      texture.fromData(data, width, height)
    } else {
      texture.fromSize(width, height)
    }
    texture.unbind()
    this.#textures.set(name, texture)
    return this
  }

  createFramebuffer(name: string, width: number, height: number) {
    const inputTexture = this.#textures.get(name)
    const framebuffer = new Framebuffer(this.#gl, {
      width,
      height,
      depth: false,
      inputTexture,
    })
    this.#framebuffers.set(name, framebuffer)
    return this
  }

  createProgram(
    programName: string,
    vertexShaderSource: string,
    fragmentShaderSource: string,
  ) {
    const { vertices, uv } = createFullscreenQuad()
    const geometry = new Geometry(this.#gl)
    geometry
      .addAttribute('position', { typedArray: vertices, size: 2 })
      .addAttribute('uv', { typedArray: uv, size: 2 })

    const mesh = new Mesh(this.#gl, {
      geometry,
      vertexShaderSource,
      fragmentShaderSource,
    })
    this.#programs.set(programName, mesh)
    return this
  }

  setProgram(programName: string) {
    this.#activeProgram = this.#programs.get(programName)
    this.#activeProgram.bindProgram()
    return this
  }

  setUniform(uniformName: string, uniformType: string, uniformValue: string) {
    this.#activeProgram.setUniform(uniformName, uniformType, uniformValue)
    return this
  }

  setSize(width: number, height: number) {
    this.#gl.viewport(0, 0, width, height)
    return this
  }

  run(inputNameArr: string[], outputName: string) {
    const framebuffer = this.#framebuffers.get(outputName)
    framebuffer.bind()
    const ext = this.#gl.getExtension('GMAN_debug_helper')
    for (let i = 0; i < inputNameArr.length; i++) {
      const inputName = inputNameArr[i]
      const inputTexture = this.#textures.get(inputName)
      this.#gl.activeTexture(this.#gl.TEXTURE0 + i)
      inputTexture.bind()
    }
    this.#activeProgram.draw()
    framebuffer.unbind()
    return this
  }

  swap(name1: string, name2: string) {
    const tex1 = this.#textures.get(name1)
    const tex2 = this.#textures.get(name2)
    let temp = tex1
    this.#textures.set(name1, tex2)
    this.#textures.set(name2, temp)

    const fbo1 = this.#framebuffers.get(name1)
    const fbo2 = this.#framebuffers.get(name2)
    temp = fbo1

    this.#framebuffers.set(name1, fbo2)
    this.#framebuffers.set(name2, temp)
  }

  reset() {
    this.#framebuffers.clear()
    this.#programs.clear()
  }
}
