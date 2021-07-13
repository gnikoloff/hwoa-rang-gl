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
}
/**
 * Generates geometry data for a box
 * @param {Box} params
 * @returns {[{ vertices, normal, uv, indices, orientation }]}
 */
export declare function createBoxSeparateFace(params?: Box): any[];
