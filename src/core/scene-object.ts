import { mat4 } from 'gl-matrix'
import { uid } from 'uid'
import { Transform } from '..'

export class SceneObject extends Transform {
  parentNode: SceneObject | null = null

  protected _children: SceneObject[] = []
  protected _visible = true

  worldMatrix = mat4.create()
  normalMatrix = mat4.create()

  uid = uid(9)
  name?: string

  get visible() {
    return this._visible
  }

  set visible(v: boolean) {
    this._visible = v
  }

  get children(): SceneObject[] {
    return this._children
  }

  get siblings(): SceneObject[] {
    if (!this.parentNode) {
      return []
    }
    return this.parentNode._children
  }

  constructor(name: string | undefined = undefined) {
    super()
    this.name = name
  }

  get levelIndex(): number {
    let levelIndex = 0
    let parentNode = this.parentNode
    while (parentNode) {
      levelIndex++
      parentNode = parentNode.parentNode
    }
    return levelIndex
  }

  setParent(parentNode: SceneObject | null = null): this {
    if (this.parentNode) {
      const idx = this.parentNode._children.indexOf(this)
      if (idx >= 0) {
        this.parentNode._children.splice(idx, 1)
      }
    }
    if (parentNode) {
      parentNode.addChild(this)
    }
    this.parentNode = parentNode
    return this
  }

  addChild(childNode: SceneObject): this {
    this._children.push(childNode)
    return this
  }

  updateWorldMatrix(parentWorldMatrix: mat4 | null = null): this {
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
    for (let i = 0; i < this._children.length; i++) {
      this._children[i].updateWorldMatrix(this.worldMatrix)
    }
    // console.log(this.worldMatrix)
    return this
  }

  traverse(
    callback: (node: SceneObject, depthLevel: number) => void,
    depth = 0,
  ): void {
    callback(this, depth)
    depth++
    for (let i = 0; i < this._children.length; i++) {
      const child = this._children[i]
      child.traverse(callback, depth)
    }
  }

  findChild(
    callback: (node: SceneObject) => SceneObject | boolean | null,
  ): SceneObject | null {
    if (callback(this)) {
      return this
    }
    let outNode: SceneObject | null = null
    for (let i = 0; i < this._children.length; i++) {
      const child = this._children[i]
      if ((outNode = child.findChild(callback))) {
        break
      }
    }
    return outNode
  }

  findChildByName(name: string): SceneObject | null {
    if (this.name === name) {
      return this
    }
    let outNode: SceneObject | null = null
    for (let i = 0; i < this._children.length; i++) {
      const child = this._children[i]
      if ((outNode = child.findChildByName(name))) {
        break
      }
    }
    return outNode
  }

  findParent(
    callback: (node: SceneObject) => SceneObject | boolean | null,
  ): SceneObject | null {
    if (callback(this)) {
      return this
    }
    let outNode: SceneObject | null = null
    let parentNode = this.parentNode
    while (parentNode) {
      if ((outNode = parentNode.findParent(callback))) {
        break
      }
      parentNode = parentNode?.parentNode
    }
    return outNode
  }

  findParentByName(name: string): SceneObject | null {
    if (this.name === name) {
      return this
    }
    let outNode: SceneObject | null = null
    let parentNode = this.parentNode
    while (parentNode) {
      if ((outNode = parentNode.findParentByName(name))) {
        break
      }
      parentNode = parentNode?.parentNode
    }
    return outNode
  }
}
