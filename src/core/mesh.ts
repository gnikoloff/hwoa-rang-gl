import { vec3, mat4 } from 'gl-matrix'

import Program from './program'
import VAO from './vao'

import { INDEX_ATTRIB_NAME, MODEL_MATRIX_UNIFORM_NAME, PROJECTION_MATRIX_UNIFORM_NAME, TRIANGLES, VIEW_MATRIX_UNIFORM_NAME } from '../utils/gl-constants'

export default class Mesh {
  public modelMatrix = mat4.create()
  public program
  public vao
  public hasIndices
  public drawMode = TRIANGLES
  
  #position = [0, 0, 0]
  #positionVec3 = vec3.create()

  #scale: [number, number, number] = [1, 1, 1]
  #scaleVec3 = vec3.create()

  #rotationAxis = [0, 0, 0]
  #rotationAxisVec3 = vec3.create()
  #rotationAngle = 0

  #gl
  #geometry
  
  constructor (gl, geometry, {
    vertexShaderSource,
    fragmentShaderSource,
  }: any = {}) {
    this.#gl = gl
    this.#geometry = geometry
    
    this.program = new Program(gl, { vertexShaderSource, fragmentShaderSource })
    this.vao = new VAO(gl)

    vec3.set(this.#scaleVec3, ...this.#scale)

    this.hasIndices = geometry.attributes.has(INDEX_ATTRIB_NAME)

    this.vao.bind()
    geometry.attributes.forEach(({
      size,
      type,
      normalized,
      stride,
      offset,
      buffer,
    }, key) => {
      if (key === INDEX_ATTRIB_NAME) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
        return
      }
      const location = this.program.getAttribLocation(key)
      this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, buffer)
      this.#gl.vertexAttribPointer(location, size, type, normalized, stride, offset)
      this.#gl.enableVertexAttribArray(location)
    })
    this.vao.unbind()
    
    this.program.bind()
    this.program.setUniform(MODEL_MATRIX_UNIFORM_NAME, 'matrix4fv', this.modelMatrix)
    this.program.unbind()
  }

  get position () {
    return this.#position
  }

  get scale () {
    return this.#scale
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

  setCamera (camera) {
    this.program.bind()
    this.program.setUniform(PROJECTION_MATRIX_UNIFORM_NAME, 'matrix4fv', camera.projectionMatrix)
    this.program.setUniform(VIEW_MATRIX_UNIFORM_NAME, 'matrix4fv', camera.viewMatrix)
    this.program.unbind()
  }

  draw () {
    this.program.bind()
    this.vao.bind()
    
    if (this.hasIndices) {
      this.#gl.drawElements(this.drawMode, this.#geometry.vertexCount, this.#gl.UNSIGNED_SHORT, 0)
    } else {
      this.#gl.drawArrays(this.drawMode, 0, this.#geometry.vertexCount)
    }

    this.vao.unbind()
    this.program.unbind()
    
  }
}