import { createProgram } from '../utils/gl-utils'

export default class Program {
  constructor(gl, { vertexShaderSource, fragmentShaderSource }) {
    this._gl = gl
    this._program = createProgram(gl, vertexShaderSource, fragmentShaderSource)

    this._attribLocations = new Map()
    this._uniformLocations = new Map()
  }

  setUniform(uniformName, uniformType, uniformValue) {
    let uniformLocation
    if (this._uniformLocations.has(uniformName)) {
      uniformLocation = this._uniformLocations.get(uniformName)
    } else {
      uniformLocation = this._gl.getUniformLocation(this._program, uniformName)
      if (uniformLocation === -1) {
        console.warn(`Could not query uniform ${attribName} location.`)
      }
      this._uniformLocations.set(uniformName, uniformLocation)
    }
    switch (uniformType) {
      case 'matrix4fv':
        this._gl.uniformMatrix4fv(uniformLocation, false, uniformValue)
        break
      case 'float':
        this._gl.uniform1f(uniformLocation, uniformValue)
        break
      case 'int':
        this._gl.uniform1i(uniformLocation, uniformValue)
        break
      default:
        return
    }
    return this
  }

  getAttribLocation(attribName) {
    if (this._attribLocations.has(attribName)) {
      return this._attribLocations.get(attribName)
    }
    const attribLocation = this._gl.getAttribLocation(this._program, attribName)
    if (attribLocation === -1) {
      console.warn(`Could not query attribute ${attribName} location.`)
    }
    this._attribLocations.set(attribName, attribLocation)
    return attribLocation
  }

  bind() {
    this._gl.useProgram(this._program)
    return this
  }

  unbind() {
    this._gl.useProgram(null)
  }
}
