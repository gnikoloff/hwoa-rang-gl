import { Transform } from './transform'
import { Program } from './program'
import { Geometry } from './geometry'
import { PerspectiveCamera } from '../camera/perspective-camera'
import { OrthographicCamera } from '../camera/orthographic-camera'
import { getExtension } from '../utils/gl-utils'

import {
  INDEX_ATTRIB_NAME,
  MODEL_MATRIX_UNIFORM_NAME,
  PROJECTION_MATRIX_UNIFORM_NAME,
  TRIANGLES,
  UNIFORM_TYPE_MATRIX4X4,
  VIEW_MATRIX_UNIFORM_NAME,
} from '../utils/gl-constants'

import {
  MeshInterface,
  OES_vertex_array_objectInterface,
  UniformType,
} from '../types'

/**
 * Mesh class for holding the geometry, program and shaders for an object.
 *
 * @public
 */
export class Mesh extends Transform {
  #gl: WebGLRenderingContext
  #geometry: Geometry

  protected vaoExtension: OES_vertex_array_objectInterface
  protected hasIndices: boolean

  public program: Program
  public vao: WebGLVertexArrayObjectOES

  /**
   * DrawMode
   * @default gl.TRIANGLES
   */
  public drawMode: GLenum = TRIANGLES

  constructor(gl: WebGLRenderingContext, params: MeshInterface) {
    super()
    const { geometry, uniforms = {}, defines = {} } = params

    let { vertexShaderSource, fragmentShaderSource } = params

    this.#gl = gl
    this.#geometry = geometry

    // Assign defines to both vertex and fragment shaders
    for (const [key, value] of Object.entries(defines)) {
      vertexShaderSource = `
        #define ${key} ${value}\n
        ${vertexShaderSource}
      `
      fragmentShaderSource = `
        #define ${key} ${value}\n
        ${fragmentShaderSource}
      `
    }

    // create mesh program and vertex array object
    this.program = new Program(gl, {
      vertexShaderSource,
      fragmentShaderSource,
    })
    this.vaoExtension = getExtension(gl, 'OES_vertex_array_object')
    this.vao = this.vaoExtension.createVertexArrayOES()
    this.hasIndices = geometry.attributes.has(INDEX_ATTRIB_NAME)

    // assign geometry attributes to mesh
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

    // assign uniforms to mesh
    this.program.bind()
    for (const [key, uniform] of Object.entries(uniforms)) {
      // @ts-ignore
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

  /**
   * Binds the program
   * @returns {this}
   */
  use(): this {
    this.program.bind()
    return this
  }

  /**
   * Set uniform value. Query the uniform location if necessary and cache it in-memory for future use
   * @param {string} uniformName
   * @param {UniformType} uniformType
   * @param uniformValue
   * @returns {this}
   */
  setUniform(
    uniformName: string,
    uniformType: UniformType,
    uniformValue: unknown,
  ): this {
    this.program.setUniform(uniformName, uniformType, uniformValue)
    return this
  }
  /**
   * Assign camera projection matrix and view matrix to model uniforms
   * @param {PerspectiveCamera|OrthographicCamera} camera
   * @returns {this}
   */
  setCamera(camera: PerspectiveCamera | OrthographicCamera): this {
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
    return this
  }

  /**
   * Renders the mesh
   * @returns {this}
   */
  draw(): this {
    if (this.shouldUpdate) {
      super.updateModelMatrix()
      this.program.setUniform(
        MODEL_MATRIX_UNIFORM_NAME,
        UNIFORM_TYPE_MATRIX4X4,
        this.modelMatrix,
      )
    }

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
