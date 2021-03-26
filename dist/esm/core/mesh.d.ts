import { mat4, ReadonlyVec3 } from 'gl-matrix';
import { Program } from './program';
import { MeshInterface, OES_vertex_array_objectInterface } from '../types';
/**
 * Mesh class for holding the geometry, program and shaders for an object.
 *
 * @public
 */
export declare class Mesh {
    #private;
    protected modelMatrixNeedsUpdate: boolean;
    protected vaoExtension: OES_vertex_array_objectInterface;
    protected hasIndices: boolean;
    modelMatrix: mat4;
    program: Program;
    vao: WebGLVertexArrayObjectOES;
    /**
     * DrawMode
     * @default gl.TRIANGLES
     */
    drawMode: GLenum;
    constructor(gl: WebGLRenderingContext, params: MeshInterface);
    get position(): ReadonlyVec3;
    get scale(): ReadonlyVec3;
    /**
     * Set uniform value. Query the uniform location if necessary and cache it in-memory for future use
     * @param {string} uniformName
     * @param {UniformType} uniformType
     * @param uniformValue
     * @returns {this}
     */
    setUniform(uniformName: any, uniformType: any, uniformValue: any): this;
    /**
     * Sets position
     * @returns {this}
     */
    setPosition(position: {
        x?: number;
        y?: number;
        z?: number;
    }): this;
    /**
     * Sets scale
     * @returns {this}
     */
    setScale(scale: {
        x?: number;
        y?: number;
        z?: number;
    }): this;
    /**
     * Sets rotation
     * @returns {this}
     */
    setRotation(rotation: {
        x?: number;
        y?: number;
        z?: number;
    }, rotationAngle: number): this;
    /**
     * Update model matrix with scale, rotation and translation
     * @returns {this}
     */
    updateModelMatrix(): this;
    /**
     * Assign camera projection matrix and view matrix to model uniforms
     * @param {PerspectiveCamera} camera
     * @returns {this}
     */
    setCamera(camera: any): this;
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
