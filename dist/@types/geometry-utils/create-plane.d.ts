interface Plane {
    /**
     * @defaultValue 1
     */
    width?: number;
    /**
     * @defaultValue 1
     */
    height?: number;
    /**
     * @defaultValue 1
     */
    widthSegments?: number;
    /**
     * @defaultValue 1
     */
    heightSegments?: number;
}
/**
 * Generates geometry data for a quad
 * @param {PlaneInterface} params
 * @returns {{ vertices, normal, uv, indices }}
 */
export declare function createPlane(params?: Plane): {
    vertices: Float32Array;
    normal: Float32Array;
    uv: Float32Array;
    indices: Uint32Array | Uint16Array;
};
export {};
