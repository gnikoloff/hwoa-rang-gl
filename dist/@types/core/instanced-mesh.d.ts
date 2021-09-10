import { Mesh } from './mesh';
import { MeshInterface } from './Mesh';
export declare class InstancedMesh extends Mesh {
    #private;
    instanceCount: number;
    constructor(gl: WebGLRenderingContext, { geometry, uniforms, defines, instanceCount, vertexShaderSource, fragmentShaderSource, }: InstancedMeshInterface);
    /**
     * @param {number} index - Instance index on which to apply the matrix
     * @param {Float32Array|Float64Array} matrix - Matrix to control the instance scale, rotation and translation
     */
    setMatrixAt(index: number, matrix: Float32Array): this;
    /**
     * Draws the instanced mesh
     */
    draw(): this;
}
interface InstancedMeshInterface extends MeshInterface {
    instanceCount?: number;
}
export {};
