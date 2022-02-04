import { mat4, ReadonlyMat4 } from 'gl-matrix'
import { uid } from 'uid'
import { Transform } from './transform'

/**
 * SceneObject that can have SceneObjects as children. Allows for proper scene graph.
 *
 * @public
 */
export class SceneObject extends Transform {
  protected renderable = false

  parentNode: SceneObject | null = null
  children: SceneObject[] = []

  worldMatrix = mat4.create()
  normalMatrix = mat4.create()

  uid = uid(9)
  name?: string

  constructor(name: string | undefined = undefined) {
    super()
    this.name = name
  }

  setParent = (parentNode: SceneObject | null = null): this => {
    if (this.parentNode) {
      const idx = this.parentNode.children.indexOf(this)
      if (idx >= 0) {
        this.parentNode.children.splice(idx, 1)
      }
    }
    if (parentNode) {
      parentNode.children.push(this)
    }
    this.parentNode = parentNode
    return this
  }

  updateWorldMatrix = (parentWorldMatrix: ReadonlyMat4 | null = null): this => {
    if (this.shouldUpdate) {
      this.updateModelMatrix()
    }
    if (parentWorldMatrix) {
      mat4.mul(this.worldMatrix, parentWorldMatrix, this.modelMatrix)
    } else {
      mat4.copy(this.worldMatrix, this.modelMatrix)
    }
    mat4.invert(this.normalMatrix, this.worldMatrix)
    mat4.transpose(this.normalMatrix, this.normalMatrix)
    this.children.forEach((child) => {
      child.updateWorldMatrix(this.worldMatrix)
    })
    return this
  }

  traverseGraph = (callback, node: SceneObject = this): this => {
    callback(node)
    this.children.forEach((child) => child.traverseGraph(callback))
    return this
  }
}
