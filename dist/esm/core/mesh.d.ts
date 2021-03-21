import { mat4 } from 'gl-matrix';
import Program from './program';
import { MeshInterface, OES_vertex_array_objectInterface } from '../ts-types';
export default class Mesh {
    #private;
    modelMatrixNeedsUpdate: boolean;
    modelMatrix: mat4;
    program: Program;
    vaoExtension: OES_vertex_array_objectInterface;
    vao: WebGLVertexArrayObjectOES;
    hasIndices: boolean;
    drawMode: number;
    /**
     *
     * @param gl
     * @param param1
     */
    constructor(gl: WebGLRenderingContext, { geometry, uniforms, vertexShaderSource, fragmentShaderSource, }: MeshInterface);
    get position(): [number, number, number];
    get scale(): [number, number, number];
    setUniform(uniformName: any, uniformType: any, uniformValue: any): this;
    setPosition({ x, y, z, }: {
        x?: number;
        y?: number;
        z?: number;
    }): this;
    setScale({ x, y, z, }: {
        x?: number;
        y?: number;
        z?: number;
    }): this;
    setRotation({ x, y, z, }: {
        x?: number;
        y?: number;
        z?: number;
    }, rotationAngle: number): this;
    updateModelMatrix(): this;
    setCamera(camera: any): this;
    draw(): this;
}
