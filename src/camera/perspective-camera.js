import { mat4 } from 'gl-matrix'

export default class PerspectiveCamera {
  static UP_VECTOR = [0, 1, 0]

  constructor(gl, fieldOfView, aspect, near, far) {
    this._gl = gl

    this._position = [0, 0, 0]
    this._projectionMatrix = mat4.create()
    this._viewMatrix = mat4.create()

    mat4.perspective(this._projectionMatrix, fieldOfView, aspect, near, far)
  }

  get projectionMatrix() {
    return this._projectionMatrix
  }

  get viewMatrix() {
    return this._viewMatrix
  }

  set position(position) {
    this._position = position
  }

  lookAt(target) {
    mat4.lookAt(this._viewMatrix, this._position, target, PerspectiveCamera.UP_VECTOR)
  }
}
