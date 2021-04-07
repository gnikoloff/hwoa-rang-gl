import { Geometry } from './core/geometry';
import { Texture } from './core/texture';
import { UNIFORM_TYPE_INT, UNIFORM_TYPE_FLOAT, UNIFORM_TYPE_VEC2, UNIFORM_TYPE_VEC3, UNIFORM_TYPE_VEC4, UNIFORM_TYPE_MATRIX4X4 } from './utils/gl-constants';
export declare type UniformType = typeof UNIFORM_TYPE_INT | typeof UNIFORM_TYPE_FLOAT | typeof UNIFORM_TYPE_VEC2 | typeof UNIFORM_TYPE_VEC3 | typeof UNIFORM_TYPE_VEC4 | typeof UNIFORM_TYPE_MATRIX4X4;
export interface MeshInterface {
    geometry: Geometry;
    /**
     * Uniforms as object list
     * @example
     * ```
     * { type: 'int', value: 1 }
     * { type: 'vec4', value: [0, 1, 2, 3] }
     * ```
     * @defaultValue {}
     */
    uniforms?: Record<string, unknown>;
    /**
     * Vertex shader program as string
     */
    vertexShaderSource: string;
    /**
     * Fragment shader program as string
     */
    fragmentShaderSource: string;
}
export interface InstancedMeshInterface extends MeshInterface {
    instanceCount?: number;
}
export interface FramebufferInterface {
    width?: number;
    height?: number;
    wrapS?: GLenum;
    wrapT?: GLenum;
    minFilter?: GLenum;
    magFilter?: GLenum;
    format?: GLenum;
    type?: GLenum;
    internalFormat?: GLenum;
    depth?: boolean;
    inputTexture?: Texture;
}
export interface TextureInterface {
    format?: GLenum;
    internalFormat?: GLenum;
    type?: GLenum;
    unpackAlignment?: number;
    wrapS?: GLenum;
    wrapT?: GLenum;
    minFilter?: GLenum;
    magFilter?: GLenum;
}
export interface OES_vertex_array_objectInterface {
    createVertexArrayOES(): WebGLVertexArrayObjectOES;
    deleteVertexArrayOES(arrayObject: WebGLVertexArrayObjectOES | null): void;
    isVertexArrayOES(arrayObject: WebGLVertexArrayObjectOES | null): boolean;
    bindVertexArrayOES(arrayObject: WebGLVertexArrayObjectOES | null): void;
}
export interface ProgramInterface {
    /**
     * Vertex shader program as string
     */
    vertexShaderSource: string;
    /**
     * Fragment shader program as string
     */
    fragmentShaderSource: string;
}
export interface WebGLElementBufferInterface {
    /**
     * Indices as typed array
     */
    typedArray: Uint32Array | Uint16Array;
}
export interface WebGLArrayBufferInterface {
    /**
     * Data as typed array
     */
    typedArray: Float32Array | Float64Array;
    /**
     * @defaultValue 1
     */
    size?: number;
    /**
     * @defaultValue 1
     */
    type?: number;
    /**
     * @defaultValue false
     */
    normalized?: boolean;
    /**
     * @defaultValue 0
     */
    stride?: number;
    /**
     * @defaultValue 1
     */
    offset?: number;
    instancedDivisor?: number;
}
export interface PlaneInterface {
    /**
     * @defaultValue 1
     */
    width?: number;
    /**
     * @defaultValue 1
     */
    height?: number;
    /**
     * @defaultValue 1
     */
    widthSegments?: number;
    /**
     * @defaultValue 1
     */
    heightSegments?: number;
}
export interface SphereInterface {
    /**
     * @defaultValue 0.5
     */
    radius?: number;
    /**
     * @defaultValue 16
     */
    widthSegments?: number;
    /**
     * @defaultValue Math.ceil(widthSegments * 0.5)
     */
    heightSegments?: number;
    /**
     * @defaultValue 0
     */
    phiStart?: number;
    /**
     * @defaultValue Math.PI * 2
     */
    phiLength?: number;
    /**
     * @defaultValue 0
     */
    thetaStart?: number;
    /**
     * @defaultValue Math.PI
     */
    thetaLength?: number;
}
export interface BoxInterface {
    /**
     * @defaultValue 1
     */
    width?: number;
    /**
     * @defaultValue 1
     */
    height?: number;
    /**
     * @defaultValue 1
     */
    depth?: number;
    /**
     * @defaultValue 1
     */
    widthSegments?: number;
    /**
     * @defaultValue 1
     */
    heightSegments?: number;
    /**
     * @defaultValue 1
     */
    depthSegments?: number;
    /**
     * @defaultValue false
     */
    separateFaces?: boolean;
}
