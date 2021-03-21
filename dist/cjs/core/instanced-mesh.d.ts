import Mesh from './mesh';
import { MeshInterface } from '../ts-types';
export default class InstancedMesh extends Mesh {
    #private;
    instanceCount: number;
    instanceAttributes: Map<any, any>;
    constructor(gl: WebGLRenderingContext, { geometry, uniforms, instanceCount, vertexShaderSource, fragmentShaderSource, }: MeshInterface);
    setMatrixAt(index: number, matrix: Float32Array): this;
    draw(): this;
}
