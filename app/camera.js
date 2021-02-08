import { mat4 } from 'gl-matrix'

export default class Camera {
  static UP_VECTOR = [0, 1, 0]

  constructor (gl, fieldOfView, aspect, near, far) {
    this._gl = gl
    
    this._position = [0, 0, 0]
    this._projectionMatrix = mat4.create()
    this._modelViewMatrix = mat4.create()

    mat4.perspective(this._projectionMatrix, fieldOfView, aspect, near, far)
    
  }
  
  get projectionMatrix () {
    return this._projectionMatrix
  }
  
  get modelViewMatrix () {
    return this._modelViewMatrix
  }

  set position (position) {
    this._position = position
  }

  lookAt (target) {
    mat4.lookAt(this._modelViewMatrix, this._position, target, Camera.UP_VECTOR)
  }
  
}