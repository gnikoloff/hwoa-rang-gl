import { ReadonlyVec3, mat4 } from 'gl-matrix'

export class OrthographicCamera {
  public static UP_VECTOR: ReadonlyVec3 = [0, 1, 0]

  public left = -1
  public right = 1
  public top = 1
  public bottom = -1
  public near = 0.1
  public far = 2000

  public zoom = 1

  public position: [number, number, number] = [0, 0, 0]
  public lookAtPosition: [number, number, number] = [0, 0, 0]

  public projectionMatrix: mat4 = mat4.create()
  public viewMatrix: mat4 = mat4.create()

  constructor({
    left = -1,
    right = 1,
    top = 1,
    bottom = -1,
    near = 0.1,
    far = 2000,
  } = {}) {
    this.left = left
    this.right = right
    this.top = top
    this.bottom = bottom

    this.near = near
    this.far = far

    this.updateProjectionMatrix()
  }

  updateViewMatrix(): this {
    mat4.lookAt(
      this.viewMatrix,
      this.position,
      this.lookAtPosition,
      OrthographicCamera.UP_VECTOR,
    )
    return this
  }

  updateProjectionMatrix(): this {
    mat4.ortho(
      this.projectionMatrix,
      this.left,
      this.right,
      this.bottom,
      this.top,
      this.near,
      this.far,
    )
    // mat4.perspective(
    //   this.projectionMatrix,
    //   this.fieldOfView,
    //   this.aspect,
    //   this.near,
    //   this.far,
    // )
    return this
  }

  lookAt(target: [number, number, number]): this {
    this.lookAtPosition = target
    this.updateViewMatrix()
    return this
  }
}
