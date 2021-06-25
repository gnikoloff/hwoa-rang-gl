export interface Box {
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
    depth?: number;
    /**
     * @defaultValue 1
     */
    widthSegments?: number;
    /**
     * @defaultValue 1
     */
    heightSegments?: number;
    /**
     * @defaultValue 1
     */
    depthSegments?: number;
    /**
     * @defaultValue false
     */
    separateFaces?: boolean;
}
/**
 * Generates geometry data for a box
 * @param {Box} params
 * @returns {{ vertices, normal, uv, indices }}
 */
export declare function createBox(params?: Box): {
    vertices: Float32Array;
    normal: Float32Array;
    uv: Float32Array;
    indices: Uint32Array | Uint16Array;
};
