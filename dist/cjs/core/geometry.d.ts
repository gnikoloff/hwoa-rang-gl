export default class Geometry {
    #private;
    attributes: Map<any, any>;
    vertexCount: number;
    constructor(gl: WebGLRenderingContext);
    addIndex({ typedArray }: {
        typedArray: Uint32Array | Uint16Array;
    }): this;
    addAttribute(key: string, { typedArray, size, type, normalized, stride, offset, instancedDivisor, }: {
        typedArray: Float32Array | Float64Array;
        size?: number;
        type?: number;
        normalized?: boolean;
        stride?: number;
        offset?: number;
        instancedDivisor: number | null;
    }): this;
    delete(): void;
}
