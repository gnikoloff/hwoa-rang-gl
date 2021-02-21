import { ProgramInterface } from '../ts-types'

import { UniformType } from '../ts-types'
import { createProgram } from '../utils/gl-utils'

import {
  vertexShaderSourceWebGL2Head,
  fragmentShaderSourceWebGL2Head,
} from '../utils/shader-snippets'

export default class Program {
  #gl: WebGLRenderingContext
  #program: WebGLProgram
  #attribLocations = new Map()
  #uniformLocations = new Map()

  constructor(
    gl: WebGLRenderingContext,
    {
      vertexShaderSource: inputVertexShaderSource,
      fragmentShaderSource: inputFragmentShaderSource,
    }: ProgramInterface,
  ) {
    this.#gl = gl

    const vertexShaderSource = `${vertexShaderSourceWebGL2Head}
      ${inputVertexShaderSource}
    `
    const fragmentShaderSource = `${fragmentShaderSourceWebGL2Head}
      ${inputFragmentShaderSource}
    `

    this.#program = createProgram(gl, vertexShaderSource, fragmentShaderSource)

    this.#attribLocations = new Map()
    this.#uniformLocations = new Map()
  }

  setUniform(
    uniformName: string,
    uniformType: UniformType,
    uniformValue: any,
  ): this {
    let uniformLocation
    if (this.#uniformLocations.has(uniformName)) {
      uniformLocation = this.#uniformLocations.get(uniformName)
    } else {
      uniformLocation = this.#gl.getUniformLocation(this.#program, uniformName)
      if (uniformLocation === -1) {
      }
      this.#uniformLocations.set(uniformName, uniformLocation)
    }
    switch (uniformType) {
      case 'matrix4fv':
        this.#gl.uniformMatrix4fv(uniformLocation, false, uniformValue)
        break
      case 'float':
        this.#gl.uniform1f(uniformLocation, uniformValue)
        break
      case 'int':
        this.#gl.uniform1i(uniformLocation, uniformValue)
        break
      default:
        return
    }
    return this
  }

  getAttribLocation(attribName: string): number {
    if (this.#attribLocations.has(attribName)) {
      return this.#attribLocations.get(attribName)
    }
    const attribLocation = this.#gl.getAttribLocation(this.#program, attribName)
    // if (attribLocation === -1) {
    //   console.warn(`Could not query attribute ${attribName} location.`)
    // }
    this.#attribLocations.set(attribName, attribLocation)
    return attribLocation
  }

  bind(): this {
    this.#gl.useProgram(this.#program)
    return this
  }

  unbind(): this {
    this.#gl.useProgram(null)
    return this
  }
}