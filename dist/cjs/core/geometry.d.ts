/**
 * Geometry class to hold buffers and attributes for a mesh.
 * Accepts the data that makes up your model - indices, vertices, uvs, normals, etc.
 * The only required attribute & buffer to render is "position"
 *
 * @public
 */
export declare class Geometry {
    #private;
    attributes: Map<any, any>;
    vertexCount: number;
    constructor(gl: WebGLRenderingContext);
    /**
     * @description Set data into element array buffer
     * @param {WebGLElementBufferInterface} params
     * @returns {this}
     */
    addIndex(params: WebGLElementBufferInterface): this;
    /**
     * @description Add attribute as array buffer
     * @param {string} key - Name of attribute. Must match attribute name in your GLSL program
     * @param {WebGLArrayBufferInterface} params
     * @returns {this}
     */
    addAttribute(key: string, params: WebGLArrayBufferInterface): this;
    /**
     * @description Delete all buffers associated with this geometry
     */
    delete(): void;
}
interface WebGLElementBufferInterface {
    /**
     * Indices as typed array
     */
    typedArray: Uint32Array | Uint16Array;
}
interface WebGLArrayBufferInterface {
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
export {};