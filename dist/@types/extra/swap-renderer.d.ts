import { Framebuffer } from '../core/framebuffer';
import { Texture } from '../core/texture';
import { UniformType } from '../core/program';
export declare class SwapRenderer {
    #private;
    constructor(gl: WebGLRenderingContext);
    /**
     * @returns {Texture}
     */
    getTexture(name: string): Texture;
    /**
     * Add external texture
     * @param {string} name Name for referencing later
     * @param {Texture} texture
     * @returns {this}
     */
    addTexture(name: string, texture: Texture): this;
    /**
     * Add external framebuffer
     * @param {string} name Name for referencing later
     * @param {Framebuffer} framebuffer
     * @returns
     */
    addFramebuffer(name: string, framebuffer: Framebuffer): this;
    /**
     * @param {string} name Name for referencing later
     * @param {number} width
     * @param {number} height
     * @param {Float32Array} data
     * @param {GLenum} filtering
     * @param {GLenum} inputType
     * @returns {this}
     */
    createTexture(name: string, width: number, height: number, data: Float32Array | null, filtering: number | undefined, inputType: GLenum): this;
    /**
     * @param {string} name Name for referencing later
     * @param {number} width
     * @param {number} height
     * @returns {this}
     */
    createFramebuffer(name: string, width: number, height: number): this;
    /**
     * @param {string} programName
     * @param {string} vertexShaderSource
     * @param {string} fragmentShaderSource
     * @returns {this}
     */
    createProgram(programName: string, vertexShaderSource: string, fragmentShaderSource: string): this;
    /**
     * Binds a program for use
     * @param {string} programName
     * @returns {this}
     */
    useProgram(programName: string): this;
    /**
     * Sets a uniform to the active program
     * @param {string} uniformName
     * @param {string} uniformType
     * @param {string} uniformValue
     * @returns {this}
     */
    setUniform(uniformName: string, uniformType: UniformType, uniformValue: string): this;
    /**
     * Set gl viewport size
     * @param {number} width
     * @param {number} height
     * @returns {this}
     */
    setSize(width: number, height: number): this;
    /**
     * Renders a program with specific inputs to output framebuffer
     * @param {String[]} inputNameArr - Name of input framebuffers
     * @param outputName - Name of output framebuffer. "null" to render to device screen
     * @returns
     */
    run(inputNameArr: string[], outputName: string): this;
    /**
     * Swap programs
     * @param {string} name1
     * @param {string} name2
     * @returns {this}
     */
    swap(name1: string, name2: string): this;
    /**
     * @returns {this}
     */
    reset(): this;
    /**
     * @returns {this}
     */
    delete(): this;
}
