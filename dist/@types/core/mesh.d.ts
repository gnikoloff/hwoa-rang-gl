import { SceneObject } from './scene-object';
import { Program } from './program';
import { Geometry } from './geometry';
import { PerspectiveCamera } from '../camera/perspective-camera';
import { OrthographicCamera } from '../camera/orthographic-camera';
import { UniformType } from './program';
/**
 * Mesh class for holding the geometry, program and shaders for an object.
 *
 * @public
 */
export declare class Mesh extends SceneObject {
    #private;
    protected vaoExtension: OES_vertex_array_objectInterface;
    protected hasIndices: boolean;
    program: Program;
    vao: WebGLVertexArrayObjectOES;
    /**
     * DrawMode
     * @default gl.TRIANGLES
     */
    drawMode: GLenum;
    constructor(gl: WebGLRenderingContext, params: MeshInterface);
    /**
     *
     * @param {string} key - Name of attribute. Must match attribute name in your GLSL program
     * @param {number} index - Index to start updating your typed array from
     * @param {number} size - How many items are to be updated
     * @param {Float32Array} subTypeArray - The whole or partial array to update your attribute with
     * @returns {this}
     */
    updateGeometryAttribute(key: string, index: number, size: number, subTypeArray: Float32Array): this;
    /**
     * Binds the program
     * @returns {this}
     */
    use(): this;
    /**
     * Set uniform value. Query the uniform location if necessary and cache it in-memory for future use
     * @param {string} uniformName
     * @param {UniformType} uniformType
     * @param uniformValue
     * @returns {this}
     */
    setUniform(uniformName: string, uniformType: UniformType, uniformValue: unknown): this;
    /**
     * Assign camera projection matrix and view matrix to model uniforms
     * @param {PerspectiveCamera|OrthographicCamera} camera
     * @returns {this}
     */
    setCamera(camera: PerspectiveCamera | OrthographicCamera): this;
    /**
     * Renders the mesh
     * @returns {this}
     */
    draw(): this;
    /**
     * Deletes the geometry, program and VAO extension associated with the Mesh
     */
    delete(): void;
}
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
     * TODO
     */
    defines?: Record<string, unknown>;
    /**
     * Vertex shader program as string
     */
    vertexShaderSource: string;
    /**
     * Fragment shader program as string
     */
    fragmentShaderSource: string;
}
interface OES_vertex_array_objectInterface {
    createVertexArrayOES(): WebGLVertexArrayObjectOES;
    deleteVertexArrayOES(arrayObject: WebGLVertexArrayObjectOES | null): void;
    isVertexArrayOES(arrayObject: WebGLVertexArrayObjectOES | null): boolean;
    bindVertexArrayOES(arrayObject: WebGLVertexArrayObjectOES | null): void;
}
export {};
