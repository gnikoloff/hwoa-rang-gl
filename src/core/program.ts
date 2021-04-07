import { ProgramInterface } from '../types'

import { UniformType } from '../types'
import { createProgram } from '../utils/gl-utils'

import {
  vertexShaderSourceHead,
  fragmentShaderSourceHead,
} from '../utils/shader-snippets'

import {
  UNIFORM_TYPE_INT,
  UNIFORM_TYPE_FLOAT,
  UNIFORM_TYPE_VEC2,
  UNIFORM_TYPE_VEC3,
  UNIFORM_TYPE_VEC4,
  UNIFORM_TYPE_MATRIX4X4,
} from '../utils/gl-constants'

/**
 * Program class for compiling GLSL shaders and linking them in a WebGLProgram and managing its state
 *
 * @public
 */
export class Program {
  #gl: WebGLRenderingContext
  #program: WebGLProgram
  #attribLocations = new Map()
  #uniformLocations = new Map()

  constructor(gl: WebGLRenderingContext, params: ProgramInterface) {
    this.#gl = gl

    const {
      vertexShaderSource: inputVertexShaderSource,
      fragmentShaderSource: inputFragmentShaderSource,
    } = params

    const vertexShaderSource = `
      ${vertexShaderSourceHead}
      ${inputVertexShaderSource}
    `
    const fragmentShaderSource = `
      ${fragmentShaderSourceHead}
      ${inputFragmentShaderSource}
    `

    this.#program = createProgram(gl, vertexShaderSource, fragmentShaderSource)

    this.#attribLocations = new Map()
    this.#uniformLocations = new Map()
  }

  /**
   * Set uniform value. Query the uniform location if necessary and cache it in-memory for future use
   * @param {string} uniformName
   * @param {UniformType} uniformType
   * @param uniformValue
   * @returns {this}
   */
  setUniform(
    uniformName: string,
    uniformType: UniformType,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    uniformValue,
  ): this {
    let uniformLocation
    if (this.#uniformLocations.has(uniformName)) {
      uniformLocation = this.#uniformLocations.get(uniformName)
    } else {
      uniformLocation = this.#gl.getUniformLocation(this.#program, uniformName)
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
        return this
    }
    return this
  }

  /**
   * Get the location for an attribute
   * @param {string} attribName
   * @returns {number} attribLocation
   */
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

  /**
   * Binds the program for use
   * @returns {this}
   */
  bind(): this {
    this.#gl.useProgram(this.#program)
    return this
  }

  /**
   * Uninds the program for use
   * @returns {this}
   */
  unbind(): this {
    this.#gl.useProgram(null)
    return this
  }

  /**
   * Deletes the program
   */
  delete(): void {
    this.#gl.deleteProgram(this.#program)
  }
}
