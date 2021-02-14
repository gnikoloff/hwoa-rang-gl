import { vec3, mat4 } from 'gl-matrix'

import type { WebGLContext } from '../ts-types'

import VAO from './vao'
import { createBuffer, createIndexBuffer } from '../utils/gl-utils'

import {
  TRIANGLES,
} from '../utils/gl-constants'

export default class Geometry {
  public drawMode = TRIANGLES
  public attributes = new Map()
  public vertexCount = 0
  public modelMatrix = mat4.create()
    
  #position = [0, 0, 0]
  #positionVec3 = vec3.create()

  #scale: [number, number, number] = [1, 1, 1]
  #scaleVec3 = vec3.create()

  #rotationAxis = [0, 0, 0]
  #rotationAxisVec3 = vec3.create()
  #rotationAngle = 0



  #gl
  #vao
  #instanceCount = -1
  #hasIndices = false
  
  

  constructor(gl: WebGLContext) {
    this.#gl = gl
    this.#vao = new VAO(gl)
    
    vec3.set(this.#scaleVec3, ...this.#scale)
  }

  setPosition ({ x = this.#position[0], y = this.#position[1], z = this.#position[2] }) {
    this.#position = [x, y, z]
    vec3.set(this.#positionVec3, x, y, z)
    return this
  }

  setScale ({ x = this.#scale[0], y = this.#scale[1], z = this.#scale[2] }) {
    this.#scale = [x, y, z]
    vec3.set(this.#scaleVec3, x, y, z)
    return this
  }

  setRotation ({ x = this.#rotationAxis[0], y = this.#rotationAxis[1], z = this.#rotationAxis[2] }, rotationAngle) {
    this.#rotationAxis = [x, y, z]
    vec3.set(this.#rotationAxisVec3, x, y, z)
    this.#rotationAngle = rotationAngle
    return this
  }

  updateModelMatrix () {
    mat4.identity(this.modelMatrix)
    mat4.scale(this.modelMatrix, this.modelMatrix, this.#scaleVec3)
    mat4.rotate(this.modelMatrix, this.modelMatrix, this.#rotationAngle, this.#rotationAxisVec3)
    mat4.translate(this.modelMatrix, this.modelMatrix, this.#positionVec3)
    return this
  }

  bind () {
    this.#vao.bind()
    return this
  }

  unbind () {
    this.#vao.unbind()
    return this
  }

  draw () {
    if (this.#hasIndices) {
      this.#gl.drawElements(
        this.drawMode,
        this.vertexCount,
        this.#gl.UNSIGNED_SHORT,
        0
      )
    } else {
      this.#gl.drawArrays(
        this.drawMode,
        0,
        this.vertexCount,
      )
    }
    return this
  }

  addIndex ({ typedArray }) {
    const { count, buffer } = createIndexBuffer(this.#gl, typedArray)
    this.#hasIndices = true
    this.vertexCount = count
    this.attributes.set('index', {
      typedArray,
      buffer,
    })
    return this
  }

  addAttribute (key, {
    typedArray,
    location,
    size = 1,
    type = this.#gl.FLOAT,
    normalized = false,
    stride = 0,
    offset = 0,
  }) {
    const buffer = createBuffer(this.#gl, typedArray)
    this.#gl.vertexAttribPointer(location, size, type, normalized, stride, offset)
    this.#gl.enableVertexAttribArray(location)
      
    if (key === 'position' && !this.vertexCount) {
      this.vertexCount = typedArray.length / size
    }
    
    this.attributes.set(key, {
      typedArray,
      location,
      size,
      type,
      normalized,
      stride,
      offset,
      buffer
    })
    return this
  }

  delete () {
    this.attributes.forEach(({ buffer }) => {
      this.#gl.deleteBuffer(buffer)
    })
    this.#vao.delete()
  }

}