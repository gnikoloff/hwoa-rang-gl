import { vec3, mat4, ReadonlyVec3 } from 'gl-matrix'

import { Program } from './program'
import { Geometry } from './geometry'

import {
  INDEX_ATTRIB_NAME,
  MODEL_MATRIX_UNIFORM_NAME,
  PROJECTION_MATRIX_UNIFORM_NAME,
  TRIANGLES,
  UNIFORM_TYPE_MATRIX4X4,
  VIEW_MATRIX_UNIFORM_NAME,
} from '../utils/gl-constants'

import { MeshInterface, OES_vertex_array_objectInterface } from '../types'
import { getExtension } from '../utils/gl-utils'
import PerspectiveCamera from '../camera/perspective-camera'

/**
 * Mesh class for holding the geometry, program and shaders for an object.
 *
 * @public
 */
export class Mesh {
  #position: ReadonlyVec3 = [0, 0, 0]
  #positionVec3: vec3 = vec3.create()

  #scale: ReadonlyVec3 = [1, 1, 1]
  #scaleVec3: vec3 = vec3.create()

  #rotationAxis: ReadonlyVec3 = [0, 0, 0]
  #rotationAxisVec3: vec3 = vec3.create()
  #rotationAngle = 0

  #gl: WebGLRenderingContext
  #geometry: Geometry

  protected modelMatrixNeedsUpdate = false
  protected vaoExtension: OES_vertex_array_objectInterface
  protected hasIndices: boolean

  public modelMatrix: mat4 = mat4.create()
  public program: Program
  public vao: WebGLVertexArrayObjectOES

  /**
   * DrawMode
   * @default gl.TRIANGLES
   */
  public drawMode: GLenum = TRIANGLES

  constructor(gl: WebGLRenderingContext, params: MeshInterface) {
    const {
      geometry,
      uniforms = {},
      vertexShaderSource,
      fragmentShaderSource,
    } = params

    this.#gl = gl
    this.#geometry = geometry

    this.program = new Program(gl, { vertexShaderSource, fragmentShaderSource })
    this.vaoExtension = getExtension(gl, 'OES_vertex_array_object')
    this.vao = this.vaoExtension.createVertexArrayOES()
    this.hasIndices = geometry.attributes.has(INDEX_ATTRIB_NAME)

    vec3.set(this.#scaleVec3, this.#scale[0], this.#scale[1], this.#scale[2])

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
      UNIFORM_TYPE_MATRIX4X4,
      this.modelMatrix,
    )
    this.program.unbind()
    return this
  }

  get position(): ReadonlyVec3 {
    return this.#position
  }

  get scale(): ReadonlyVec3 {
    return this.#scale
  }

  /**
   * Set uniform value. Query the uniform location if necessary and cache it in-memory for future use
   * @param {string} uniformName
   * @param {UniformType} uniformType
   * @param uniformValue
   * @returns {this}
   */
  setUniform(uniformName, uniformType, uniformValue): this {
    this.program.bind()
    this.program.setUniform(uniformName, uniformType, uniformValue)
    this.program.unbind()
    return this
  }

  /**
   * Sets position
   * @returns {this}
   */
  setPosition(position: { x?: number; y?: number; z?: number }): this {
    const {
      x = this.#position[0],
      y = this.#position[1],
      z = this.#position[2],
    } = position
    this.#position = [x, y, z]
    vec3.set(this.#positionVec3, x, y, z)
    this.modelMatrixNeedsUpdate = true
    return this
  }

  /**
   * Sets scale
   * @returns {this}
   */
  setScale(scale: { x?: number; y?: number; z?: number }): this {
    const { x = this.#scale[0], y = this.#scale[1], z = this.#scale[2] } = scale
    this.#scale = [x, y, z]
    vec3.set(this.#scaleVec3, x, y, z)
    this.modelMatrixNeedsUpdate = true
    return this
  }

  /**
   * Sets rotation
   * @returns {this}
   */
  setRotation(
    rotation: {
      x?: number
      y?: number
      z?: number
    },
    rotationAngle: number,
  ): this {
    const {
      x = this.#rotationAxis[0],
      y = this.#rotationAxis[1],
      z = this.#rotationAxis[2],
    } = rotation
    this.#rotationAxis = [x, y, z]
    vec3.set(this.#rotationAxisVec3, x, y, z)
    this.#rotationAngle = rotationAngle
    this.modelMatrixNeedsUpdate = true
    return this
  }

  /**
   * Update model matrix with scale, rotation and translation
   * @returns {this}
   */
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
      UNIFORM_TYPE_MATRIX4X4,
      this.modelMatrix,
    )
    this.program.unbind()
    return this
  }

  /**
   * Assign camera projection matrix and view matrix to model uniforms
   * @param {PerspectiveCamera} camera
   * @returns {this}
   */
  setCamera(camera): this {
    this.program.bind()
    this.program.setUniform(
      PROJECTION_MATRIX_UNIFORM_NAME,
      UNIFORM_TYPE_MATRIX4X4,
      camera.projectionMatrix,
    )
    this.program.setUniform(
      VIEW_MATRIX_UNIFORM_NAME,
      UNIFORM_TYPE_MATRIX4X4,
      camera.viewMatrix,
    )
    this.program.unbind()
    return this
  }

  /**
   * Renders the mesh
   * @returns {this}
   */
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

  /**
   * Deletes the geometry, program and VAO extension associated with the Mesh
   */
  delete(): void {
    this.#geometry.delete()
    this.program.delete()
    this.vaoExtension.deleteVertexArrayOES(this.vao)
  }
}
