import { mat4 } from 'gl-matrix'

export default class PerspectiveCamera {
  static UP_VECTOR = [0, 1, 0]

  position = [0, 0, 0]
  lookAtPosition = [0, 0, 0]

  constructor(fieldOfView, aspect, near, far) {
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

  updateViewMatrix() {
    mat4.lookAt(this._viewMatrix, this.position, this.lookAtPosition, PerspectiveCamera.UP_VECTOR)
  }

  lookAt(target) {
    console.log(target)
    this.lookAtPosition = target
    mat4.lookAt(this._viewMatrix, this.position, target, PerspectiveCamera.UP_VECTOR)
  }
}
