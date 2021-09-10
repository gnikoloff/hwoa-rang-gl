interface Torus {
    /**
     * @defaultValue 0.5
     */
    radius?: number;
    /**
     * @defaultValue 0.35
     */
    tube?: number;
    /**
     * @defaultValue Math.PI * 2
     */
    arc?: number;
    /**
     * @defaultValue Math.PI * 2
     */
    radialSegments?: number;
    /**
     * @defaultValue Math.PI * 2
     */
    tubularSegments?: number;
}
/**
 * @description Generate torus geometry
 * @param {Torus} params
 * @returns {{ vertices, normal, uv, indices }}
 */
export declare function createTorus(params?: Torus): {
    indices: Uint32Array | Uint16Array;
    vertices: Float32Array;
    normal: Float32Array;
    uv: Float32Array;
};
export {};
