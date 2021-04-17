export interface Sphere {
    /**
     * @defaultValue 0.5
     */
    radius?: number;
    /**
     * @defaultValue 16
     */
    widthSegments?: number;
    /**
     * @defaultValue Math.ceil(widthSegments * 0.5)
     */
    heightSegments?: number;
    /**
     * @defaultValue 0
     */
    phiStart?: number;
    /**
     * @defaultValue Math.PI * 2
     */
    phiLength?: number;
    /**
     * @defaultValue 0
     */
    thetaStart?: number;
    /**
     * @defaultValue Math.PI
     */
    thetaLength?: number;
}
/**
 * Generates geometry data for a sphere
 * @param {Sphere} params
 * @returns {{ vertices, normal, uv, indices }}
 */
export declare function createSphere(params?: Sphere): {
    vertices: Float32Array;
    normal: Float32Array;
    uv: Float32Array;
    indices: Uint32Array | Uint16Array;
};
