import { mat4, ReadonlyMat4, vec3 } from 'gl-matrix'

/**
 * Base transform class to handle vectors and matrices
 *
 * @public
 */
export class Transform {
  public position: vec3 = vec3.fromValues(0, 0, 0)
  public rotation: vec3 = vec3.fromValues(0, 0, 0)
  public scale: vec3 = vec3.fromValues(1, 1, 1)

  public modelMatrix = mat4.create()

  public shouldUpdate = true

  /**
   * @returns {this}
   */
  copyFromMatrix(matrix: ReadonlyMat4) {
    mat4.copy(this.modelMatrix, matrix)
    this.shouldUpdate = false
    return this
  }

  /**
   * @returns {this}
   */
  setPosition(position: { x?: number; y?: number; z?: number }): this {
    const {
      x = this.position[0],
      y = this.position[1],
      z = this.position[2],
    } = position
    vec3.set(this.position, x, y, z)
    this.shouldUpdate = true
    return this
  }

  /**
   * Sets scale
   * @returns {this}
   */
  setScale(scale: { x?: number; y?: number; z?: number }): this {
    const { x = this.scale[0], y = this.scale[1], z = this.scale[2] } = scale
    vec3.set(this.scale, x, y, z)
    this.shouldUpdate = true
    return this
  }

  /**
   * Sets rotation
   * @returns {this}
   */
  setRotation(rotation: { x?: number; y?: number; z?: number }): this {
    const {
      x = this.rotation[0],
      y = this.rotation[1],
      z = this.rotation[2],
    } = rotation
    vec3.set(this.rotation, x, y, z)
    this.shouldUpdate = true
    return this
  }

  /**
   * Update model matrix with scale, rotation and translation
   * @returns {this}
   */
  updateModelMatrix(): this {
    mat4.identity(this.modelMatrix)
    mat4.translate(this.modelMatrix, this.modelMatrix, this.position)
    mat4.rotateX(this.modelMatrix, this.modelMatrix, this.rotation[0])
    mat4.rotateY(this.modelMatrix, this.modelMatrix, this.rotation[1])
    mat4.rotateZ(this.modelMatrix, this.modelMatrix, this.rotation[2])
    mat4.scale(this.modelMatrix, this.modelMatrix, this.scale)
    this.shouldUpdate = false
    return this
  }
}
