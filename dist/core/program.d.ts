import { ProgramInterface } from '../ts-types';
import { UniformType } from '../ts-types';
export default class Program {
    #private;
    constructor(gl: WebGLRenderingContext, { vertexShaderSource: inputVertexShaderSource, fragmentShaderSource: inputFragmentShaderSource, }: ProgramInterface);
    setUniform(uniformName: string, uniformType: UniformType, uniformValue: any): this;
    getAttribLocation(attribName: string): number;
    bind(): this;
    unbind(): this;
}
