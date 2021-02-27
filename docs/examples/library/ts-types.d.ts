import Geometry from './core/geometry';
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
export declare type UniformType = 'matrix4fv' | 'vec2' | 'vec3' | 'vec4' | 'float' | 'int';
