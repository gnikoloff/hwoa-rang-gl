import { vec3, mat4 } from 'gl-matrix'

import Program from './program'
import Geometry from './geometry'

import {
  INDEX_ATTRIB_NAME,
  MODEL_MATRIX_UNIFORM_NAME,
  PROJECTION_MATRIX_UNIFORM_NAME,
  TRIANGLES,
  VIEW_MATRIX_UNIFORM_NAME,
} from '../utils/gl-constants'

import { MeshInterface, OES_vertex_array_objectInterface } from '../ts-types'
import { getExtension } from '../utils/gl-utils'

export default class Mesh {
  #position: [number, number, number] = [0, 0, 0]
  #positionVec3: vec3 = vec3.create()

  #scale: [number, number, number] = [1, 1, 1]
  #scaleVec3: vec3 = vec3.create()

  #rotationAxis: [number, number, number] = [0, 0, 0]
  #rotationAxisVec3: vec3 = vec3.create()
  #rotationAngle = 0

  #gl: WebGLRenderingContext
  #geometry: Geometry

  public modelMatrixNeedsUpdate = false
  public modelMatrix: mat4 = mat4.create()
  public program: Program
  public vaoExtension: OES_vertex_array_objectInterface
  public vao: WebGLVertexArrayObjectOES
  public hasIndices: boolean
  public drawMode = TRIANGLES

  /**
   *
   * @param gl
   * @param param1
   */
  constructor(
    gl: WebGLRenderingContext,
    {
      geometry,
      uniforms = {},
      vertexShaderSource,
      fragmentShaderSource,
    }: MeshInterface,
  ) {
    this.#gl = gl
    this.#geometry = geometry

    this.program = new Program(gl, { vertexShaderSource, fragmentShaderSource })
    this.vaoExtension = getExtension(gl, 'OES_vertex_array_object')
    this.vao = this.vaoExtension.createVertexArrayOES()

    vec3.set(this.#scaleVec3, ...this.#scale)

    this.hasIndices = geometry.attributes.has(INDEX_ATTRIB_NAME)

    this.vaoExtension.bindVertexArrayOES(this.vao)
    geometry.attributes.forEach(
      ({ size, type, normalized, stride, offset, buffer }, key) => {
        if (key === INDEX_ATTRIB_NAME) {
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
          return
        }
        const location = this.program.getAttribLocation(key)
        if (location === -1) {
          return
        }
        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, buffer)
        this.#gl.vertexAttribPointer(
          location,
          size,
          type,
          normalized,
          stride,
          offset,
        )
        this.#gl.enableVertexAttribArray(location)
      },
    )
    this.vaoExtension.bindVertexArrayOES(null)

    this.program.bind()
    for (const [key, uniform] of Object.entries(uniforms)) {
      this.program.setUniform(key, uniform['type'], uniform['value'])
    }
    this.program.setUniform(
      MODEL_MATRIX_UNIFORM_NAME,
      'mat4',
      this.modelMatrix,
    )
    this.program.unbind()
    return this
  }

  get position(): [number, number, number] {
    return this.#position
  }

  get scale(): [number, number, number] {
    return this.#scale
  }

  setUniform(uniformName, uniformType, uniformValue): this {
    this.program.bind()
    this.program.setUniform(uniformName, uniformType, uniformValue)
    this.program.unbind()
    return this
  }

  setPosition({
    x = this.#position[0],
    y = this.#position[1],
    z = this.#position[2],
  }: {
    x?: number
    y?: number
    z?: number
  }): this {
    this.#position = [x, y, z]
    vec3.set(this.#positionVec3, x, y, z)
    this.modelMatrixNeedsUpdate = true
    return this
  }

  setScale({
    x = this.#scale[0],
    y = this.#scale[1],
    z = this.#scale[2],
  }: {
    x?: number
    y?: number
    z?: number
  }): this {
    this.#scale = [x, y, z]
    vec3.set(this.#scaleVec3, x, y, z)
    this.modelMatrixNeedsUpdate = true
    return this
  }

  setRotation(
    {
      x = this.#rotationAxis[0],
      y = this.#rotationAxis[1],
      z = this.#rotationAxis[2],
    }: {
      x?: number
      y?: number
      z?: number
    },
    rotationAngle: number,
  ): this {
    this.#rotationAxis = [x, y, z]
    vec3.set(this.#rotationAxisVec3, x, y, z)
    this.#rotationAngle = rotationAngle
    this.modelMatrixNeedsUpdate = true
    return this
  }

  updateModelMatrix(): this {
    mat4.identity(this.modelMatrix)
    mat4.translate(this.modelMatrix, this.modelMatrix, this.#positionVec3)
    mat4.rotate(
      this.modelMatrix,
      this.modelMatrix,
      this.#rotationAngle,
      this.#rotationAxisVec3,
    )
    mat4.scale(this.modelMatrix, this.modelMatrix, this.#scaleVec3)
    this.program.bind()
    this.program.setUniform(
      MODEL_MATRIX_UNIFORM_NAME,
      'mat4',
      this.modelMatrix,
    )
    this.program.unbind()
    return this
  }

  setCamera(camera): this {
    this.program.bind()
    this.program.setUniform(
      PROJECTION_MATRIX_UNIFORM_NAME,
      'mat4',
      camera.projectionMatrix,
    )
    this.program.setUniform(
      VIEW_MATRIX_UNIFORM_NAME,
      'mat4',
      camera.viewMatrix,
    )
    this.program.unbind()
    return this
  }

  draw(): this {
    if (this.modelMatrixNeedsUpdate) {
      this.updateModelMatrix()
      this.modelMatrixNeedsUpdate = false
    }

    this.program.bind()
    this.vaoExtension.bindVertexArrayOES(this.vao)

    if (this.hasIndices) {
      this.#gl.drawElements(
        this.drawMode,
        this.#geometry.vertexCount,
        this.#gl.UNSIGNED_SHORT,
        0,
      )
    } else {
      this.#gl.drawArrays(this.drawMode, 0, this.#geometry.vertexCount)
    }

    this.vaoExtension.bindVertexArrayOES(null)
    this.program.unbind()
    return this
  }
}
