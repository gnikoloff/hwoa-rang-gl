import Geometry from './core/geometry';
import { UNIFORM_TYPE_INT, UNIFORM_TYPE_FLOAT, UNIFORM_TYPE_VEC2, UNIFORM_TYPE_VEC3, UNIFORM_TYPE_VEC4, UNIFORM_TYPE_MATRIX4X4 } from './utils/gl-constants';
export interface MeshInterface {
    geometry: Geometry;
    uniforms: Record<string, unknown>;
    instanceCount?: number;
    vertexShaderSource: string;
    fragmentShaderSource: string;
}
export interface RenderTargetInterface {
    width?: number;
    height?: number;
    target?: number;
    wrapS?: number;
    wrapT?: number;
    format?: number;
    internalFormat?: number;
    depth?: boolean;
    type: number;
}
export interface OES_vertex_array_objectInterface {
    createVertexArrayOES(): WebGLVertexArrayObjectOES | null;
    deleteVertexArrayOES(arrayObject: WebGLVertexArrayObjectOES | null): void;
    isVertexArrayOES(arrayObject: WebGLVertexArrayObjectOES | null): boolean;
    bindVertexArrayOES(arrayObject: WebGLVertexArrayObjectOES | null): void;
}
export interface ProgramInterface {
    vertexShaderSource: string;
    fragmentShaderSource: string;
}
export declare type WebGLVAO = WebGLVertexArrayObjectOES | WebGLVertexArrayObject;
export declare type UniformType = typeof UNIFORM_TYPE_INT | typeof UNIFORM_TYPE_FLOAT | typeof UNIFORM_TYPE_VEC2 | typeof UNIFORM_TYPE_VEC3 | typeof UNIFORM_TYPE_VEC4 | typeof UNIFORM_TYPE_MATRIX4X4;
