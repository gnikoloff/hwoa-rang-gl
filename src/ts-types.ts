import Geometry from './core/geometry'

export interface MeshInterface {
  geometry: Geometry
  uniforms: Record<string, unknown>
  instanceCount?: number
  vertexShaderSource: string
  fragmentShaderSource: string
}

export interface RenderTargetInterface {
  width?: number
  height?: number
  target?: number
  wrapS?: number
  wrapT?: number
  format?: number
  internalFormat?: number
  depth?: boolean
}

export interface OES_vertex_array_objectInterface {
  // TS's lib.dom (as of v3.1.3) does not specify the nulls
  createVertexArrayOES(): WebGLVertexArrayObjectOES | null
  deleteVertexArrayOES(arrayObject: WebGLVertexArrayObjectOES | null): void
  isVertexArrayOES(arrayObject: WebGLVertexArrayObjectOES | null): boolean
  bindVertexArrayOES(arrayObject: WebGLVertexArrayObjectOES | null): void
}

export type WebGLVAO = WebGLVertexArrayObjectOES | WebGLVertexArrayObject

export type UniformType = 'matrix4fv' | 'float' | 'int'
