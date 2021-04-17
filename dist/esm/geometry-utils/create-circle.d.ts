interface Circle {
    /**
     * @default 1
     */
    radius?: number;
    /**
     * @default 8
     */
    segments?: number;
    /**
     * @default 0
     */
    thetaStart?: number;
    /**
     * @default Math.PI * 2
     */
    thetaLength?: number;
}
/**
 * @description Generate circle geometry
 * @param {Circle} params
 * @returns {{ vertices, normal, uv, indices }}
 */
export declare function createCircle(params?: Circle): {
    indices: Uint32Array | Uint16Array;
    vertices: Float32Array;
    normal: Float32Array;
    uv: Float32Array;
};
export {};
