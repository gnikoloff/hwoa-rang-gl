import { getExtension } from '../utils/gl-utils'

export default class VAO {
  static makeWebGL2VAO (gl) {
    const vao = gl.createVertexArray()
    return vao
  }

  static makeWebGL1VAO (gl) {
    const ext = getExtension(gl, 'OES_vertex_array_object')
    const vao = ext.createVertexArrayOES()
    return { ext, vao }
  }

  constructor (gl) {
    this._gl = gl

    if (gl.isWebGL2) {
      this._vao = VAO.makeWebGL2VAO(gl)
    } else {
      const { vao, ext } = VAO.makeWebGL1VAO()
      this._vao = vao
      this._ext = ext
    }
  }

  bind () {
    if (this._gl.isWebGL2) {
      this._gl.bindVertexArray(this._vao)
    } else {
      this._ext.bindVertexArrayOES(this._vao)
    }
  }

  unbind () {
    if (this._gl.isWebGL2) {
      this._gl.bindVertexArray(null)
    } else {
      this._ext.bindVertexArrayOES(null)
    }
  }

  delete () {
    if (this._gl.isWebGL2) {
      this._gl.deleteVertexArray(this._vao)
    } else {
      this._ext.deleteVertexArrayOES(this._vao)
    }
    this._vao = null
  }

}