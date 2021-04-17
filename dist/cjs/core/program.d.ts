import { UNIFORM_TYPE_INT, UNIFORM_TYPE_FLOAT, UNIFORM_TYPE_VEC2, UNIFORM_TYPE_VEC3, UNIFORM_TYPE_VEC4, UNIFORM_TYPE_MATRIX4X4 } from '../utils/gl-constants';
/**
 * Program class for compiling GLSL shaders and linking them in a WebGLProgram and managing its state
 *
 * @public
 */
export declare class Program {
    #private;
    constructor(gl: WebGLRenderingContext, params: ProgramInterface);
    /**
     * Set uniform value. Query the uniform location if necessary and cache it in-memory for future use
     * @param {string} uniformName
     * @param {UniformType} uniformType
     * @param uniformValue
     * @returns {this}
     */
    setUniform(uniformName: string, uniformType: UniformType, uniformValue: any): this | null;
    /**
     * Get the location for an attribute
     * @param {string} attribName
     * @returns {number} attribLocation
     */
    getAttribLocation(attribName: string): number | null;
    /**
     * Binds the program for use
     * @returns {this}
     */
    bind(): this;
    /**
     * Uninds the program for use
     * @returns {this}
     */
    unbind(): this;
    /**
     * Deletes the program
     */
    delete(): void;
}
export declare type UniformType = typeof UNIFORM_TYPE_INT | typeof UNIFORM_TYPE_FLOAT | typeof UNIFORM_TYPE_VEC2 | typeof UNIFORM_TYPE_VEC3 | typeof UNIFORM_TYPE_VEC4 | typeof UNIFORM_TYPE_MATRIX4X4;
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
