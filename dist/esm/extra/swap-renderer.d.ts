import { Framebuffer } from '../core/framebuffer';
import { Texture } from '../core/texture';
import { UniformType } from '../core/program';
export declare class SwapRenderer {
    #private;
    constructor(gl: WebGLRenderingContext);
    getTexture(name: string): Texture;
    addTexture(name: string, texture: Texture): this;
    createTexture(name: string, width: number, height: number, data: Float32Array | null, filtering: number | undefined, inputType: GLenum): this;
    addFramebuffer(name: string, framebuffer: Framebuffer): this;
    createFramebuffer(name: string, width: number, height: number): this;
    createProgram(programName: string, vertexShaderSource: string, fragmentShaderSource: string): this;
    useProgram(programName: string): this;
    setUniform(uniformName: string, uniformType: UniformType, uniformValue: string): this;
    setSize(width: number, height: number): this;
    run(inputNameArr: string[], outputName: string): this;
    swap(name1: string, name2: string): this;
    reset(): this;
}
