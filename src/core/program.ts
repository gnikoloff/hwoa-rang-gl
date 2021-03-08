import { ProgramInterface } from '../ts-types'

import { UniformType } from '../ts-types'
import { createProgram } from '../utils/gl-utils'

import {
  vertexShaderSourceWebGL2Head,
  fragmentShaderSourceWebGL2Head,
} from '../utils/shader-snippets'

import {
  UNIFORM_TYPE_INT,
  UNIFORM_TYPE_FLOAT,
  UNIFORM_TYPE_VEC2,
  UNIFORM_TYPE_VEC3,
  UNIFORM_TYPE_VEC4,
  UNIFORM_TYPE_MATRIX4X4
} from '../utils/gl-constants'
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
      case UNIFORM_TYPE_MATRIX4X4:
        this.#gl.uniformMatrix4fv(uniformLocation, false, uniformValue)
        break
      case UNIFORM_TYPE_VEC2:
        this.#gl.uniform2f(uniformLocation, uniformValue[0], uniformValue[1])
        break
      case UNIFORM_TYPE_VEC3:
        this.#gl.uniform3f(
          uniformLocation,
          uniformValue[0],
          uniformValue[1],
          uniformValue[2],
        )
        break
      case UNIFORM_TYPE_VEC4:
        this.#gl.uniform4f(
          uniformLocation,
          uniformValue[0],
          uniformValue[1],
          uniformValue[2],
          uniformValue[3],
        )
        break
      case UNIFORM_TYPE_FLOAT:
        this.#gl.uniform1f(uniformLocation, uniformValue)
        break
      case UNIFORM_TYPE_INT:
        this.#gl.uniform1i(uniformLocation, uniformValue)
        break
      default:
        console.error(`Unrecognised uniform type: ${uniformType}`)
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
