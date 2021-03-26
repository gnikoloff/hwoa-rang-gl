import { BoxInterface, PlaneInterface, SphereInterface } from '../types';
/**
 * Generates geometry data for a quad
 * @param {PlaneInterface} params
 * @returns {{ vertices, normal, uv, indices }}
 */
export declare function createPlane(params?: PlaneInterface): {
    vertices: Float32Array;
    normal: Float32Array;
    uv: Float32Array;
    indices: Uint32Array | Uint16Array;
};
export declare function createBox(params?: BoxInterface): any[] | {
    vertices: Float32Array;
    normal: Float32Array;
    uv: Float32Array;
    indices: Uint32Array | Uint16Array;
};
/**
 * Generates geometry data for a fullscreen quad in normalized coordinates
 * @param {SphereInterface} params
 * @returns {{ vertices, uv }}
 */
export declare function createFullscreenQuad(): {
    vertices: Float32Array;
    uv: Float32Array;
};
/**
 * Generates geometry data for a sphere
 * @param {SphereInterface} params
 * @returns {{ vertices, normal, uv, indices }}
 */
export declare function createSphere(params?: SphereInterface): {
    vertices: Float32Array;
    normal: Float32Array;
    uv: Float32Array;
    indices: Uint32Array | Uint16Array;
};
