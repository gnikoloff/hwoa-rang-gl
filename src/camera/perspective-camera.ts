import { mat4 } from 'gl-matrix'

export default class PerspectiveCamera {
  public static UP_VECTOR: [number, number, number] = [0, 1, 0]

  public position: [number, number, number] = [0, 0, 0]
  public lookAtPosition: [number, number, number] = [0, 0, 0]

  public projectionMatrix: mat4 = mat4.create()
  public viewMatrix: mat4 = mat4.create()

  public zoom = 1

  public fieldOfView: number
  public aspect: number
  public near: number
  public far: number

  constructor(fieldOfView, aspect, near, far) {
    this.fieldOfView = fieldOfView
    this.aspect = aspect
    this.near = near
    this.far = far
    
    this.updateProjectionMatrix()
  }

  updateViewMatrix(): this {
    mat4.lookAt(
      this.viewMatrix,
      this.position,
      this.lookAtPosition,
      PerspectiveCamera.UP_VECTOR,
    )
    return this
  }
  
  updateProjectionMatrix(): this {
    mat4.perspective(this.projectionMatrix, this.fieldOfView, this.aspect, this.near, this.far)
    return this
  }

  lookAt(target: [number, number, number]): this {
    this.lookAtPosition = target
    this.updateViewMatrix()
    return this
  }
}
