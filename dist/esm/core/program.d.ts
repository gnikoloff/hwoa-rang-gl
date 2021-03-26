import { ProgramInterface } from '../types';
import { UniformType } from '../types';
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
    setUniform(uniformName: string, uniformType: UniformType, uniformValue: any): this;
    /**
     * Get the location for an attribute
     * @param {string} attribName
     * @returns {number} attribLocation
     */
    getAttribLocation(attribName: string): number;
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
