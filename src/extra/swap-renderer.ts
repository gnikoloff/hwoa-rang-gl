import { Framebuffer } from '../core/framebuffer'
import { Geometry } from '../core/geometry'
import { Mesh } from '../core/mesh'
import { getExtension } from '../utils/gl-utils'
import { createPlane } from '../geometry-utils'
import { Texture } from '../core/texture'
import { OrthographicCamera } from '../camera/orthographic-camera'
import { UniformType } from '../types'

export class SwapRenderer {
  #gl: WebGLRenderingContext

  #framebuffers = new Map()
  #programs = new Map()
  #textures = new Map()
  #camera: OrthographicCamera

  #activeProgram!: Mesh

  constructor(gl: WebGLRenderingContext) {
    this.#gl = gl

    this.#camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 2)
    this.#camera.position = [0, 0, 1]
    this.#camera.lookAt([0, 0, 0])

    const ext1 = getExtension(gl, 'OES_texture_float')
    if (!ext1) {
      // TODO: handle
    }
  }

  getTexture(name: string): Texture {
    const texture = this.#textures.get(name)
    if (!texture) {
      // ...
    }
    return texture
  }

  addTexture(name: string, texture: Texture): this {
    this.#textures.set(name, texture)
    return this
  }

  createTexture(
    name: string,
    width: number,
    height: number,
    data: Float32Array | null,
    filtering = this.#gl.NEAREST,
  ): this {
    const texture = new Texture(this.#gl, {
      type: this.#gl.FLOAT,
      format: this.#gl.RGBA,
      minFilter: filtering,
      magFilter: filtering,
    })
    texture.bind()
    if (data) {
      texture.fromData(data, width, height)
    } else {
      texture.fromSize(width, height)
    }
    texture.unbind()
    this.addTexture(name, texture)
    return this
  }

  addFramebuffer(name: string, framebuffer: Framebuffer): this {
    this.#framebuffers.set(name, framebuffer)
    return this
  }

  createFramebuffer(name: string, width: number, height: number): this {
    const inputTexture = this.#textures.get(name)
    const framebuffer = new Framebuffer(this.#gl, {
      width,
      height,
      depth: false,
      inputTexture,
    })
    this.addFramebuffer(name, framebuffer)
    return this
  }

  createProgram(
    programName: string,
    vertexShaderSource: string,
    fragmentShaderSource: string,
  ): this {
    const { indices, vertices, uv } = createPlane()
    const geometry = new Geometry(this.#gl)
    geometry
      .addIndex({ typedArray: indices })
      .addAttribute('position', { typedArray: vertices, size: 3 })
      .addAttribute('uv', { typedArray: uv, size: 2 })

    const mesh = new Mesh(this.#gl, {
      geometry,
      vertexShaderSource,
      fragmentShaderSource,
    })
    this.#programs.set(programName, mesh)
    return this
  }

  useProgram(programName: string): this {
    this.#activeProgram = this.#programs.get(programName)!
    this.#activeProgram.use()
    return this
  }

  setUniform(
    uniformName: string,
    uniformType: UniformType,
    uniformValue: string,
  ): this {
    this.#activeProgram.setUniform(uniformName, uniformType, uniformValue)
    return this
  }

  setSize(width: number, height: number): this {
    this.#gl.viewport(0, 0, width, height)
    return this
  }

  run(inputNameArr: string[], outputName: string): this {
    let framebuffer
    if (outputName) {
      framebuffer = this.#framebuffers.get(outputName)
      framebuffer.bind()
    } else {
      this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null)
    }

    for (let i = 0; i < inputNameArr.length; i++) {
      const inputName = inputNameArr[i]
      const inputTexture = this.#textures.get(inputName)
      this.#gl.activeTexture(this.#gl.TEXTURE0 + i)
      inputTexture.bind()
    }
    this.#activeProgram.setCamera(this.#camera).draw()
    if (framebuffer) {
      framebuffer.unbind()
    }
    return this
  }

  swap(name1: string, name2: string): this {
    const tex1 = this.#textures.get(name1)
    const tex2 = this.#textures.get(name2)
    this.#textures.set(name1, tex2)
    this.#textures.set(name2, tex1)

    const fbo1 = this.#framebuffers.get(name1)
    const fbo2 = this.#framebuffers.get(name2)
    this.#framebuffers.set(name1, fbo2)
    this.#framebuffers.set(name2, fbo1)

    return this
  }

  reset(): this {
    this.#framebuffers.clear()
    this.#programs.clear()
    return this
  }
}
