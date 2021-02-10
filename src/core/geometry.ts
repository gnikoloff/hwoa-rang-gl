import { mat4 } from 'gl-matrix'

import type { WebGLContext } from '../ts-types'

import VAO from './vao'
import { createBuffer, createIndexBuffer, getExtension } from '../utils/gl-utils'
import { vec3 } from 'gl-matrix'

export default class Geometry {
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
  #vertexCount: number
  #instancedExtension

  constructor(gl: WebGLContext) {
    this.#gl = gl
    this.#vao = new VAO(gl)

    this.#instancedExtension = getExtension(gl, 'ANGLE_instanced_arrays')

    vec3.set(this.#scaleVec3, ...this.#scale)
  }

  set instanceCount (count: number) {
    this.#instanceCount = count
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
      if (this.#instanceCount !== -1) {
        if (this.#gl.isWebGL2) {
          this.#gl.drawElementsInstanced(
            this.#gl.TRIANGLES,
            this.#vertexCount,
            this.#gl.UNSIGNED_SHORT,
            0,
            this.#instanceCount
          )
        } else {
          this.#instancedExtension.drawElementsInstancedANGLE(
            this.#gl.TRIANGLES,
            this.#vertexCount,
            this.#gl.UNSIGNED_SHORT,
            0,
            this.#instanceCount
          )
        }
      } else {
        this.#gl.drawElements(
          this.#gl.TRIANGLES,
          this.#vertexCount,
          this.#gl.UNSIGNED_SHORT,
          0
        )
      }
    } else {
      // drawArrays
    }
    return this
  }

  addIndex ({ typedArray }) {
    const { count, buffer } = createIndexBuffer(this.#gl, typedArray)
    this.#hasIndices = true
    this.#vertexCount = count
    this.attributes.set('index', {
      typedArray,
      buffer,
    })
    return this
  }

  addInstancedAttribute (key, {
    typedArray,
    location,
    size = 1,
    type = this.#gl.FLOAT,
    normalized = false,
    stride = 0,
    offset = 0,
    instancedDivisor = 1,
  }) {
    const buffer = createBuffer(this.#gl, typedArray)
    this.#gl.vertexAttribPointer(location, size, type, normalized, stride, offset)
    this.#gl.enableVertexAttribArray(location)
    if (this.#gl.isWebGL2) {
      this.#gl.vertexAttribDivisor(location, 1)
    } else {
      this.#instancedExtension.vertexAttribDivisorANGLE(location, instancedDivisor)
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
      
    if (key === 'position' && !this.#vertexCount) {
      this.#vertexCount = typedArray.length / typedArray.size
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