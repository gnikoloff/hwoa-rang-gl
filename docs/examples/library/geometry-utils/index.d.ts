export function createPlane({ width, height, widthSegments, heightSegments, attributes, }?: {
    width?: number;
    height?: number;
    widthSegments?: number;
    heightSegments?: number;
    attributes?: {};
}): {
    vertices: Float32Array;
    normal: Float32Array;
    uv: Float32Array;
    indices: Uint16Array | Uint32Array;
};
export function createBox({ width, height, depth, widthSegments, heightSegments, depthSegments, separateFaces, }?: {
    width?: number;
    height?: number;
    depth?: number;
    widthSegments?: number;
    heightSegments?: number;
    depthSegments?: number;
    separateFaces?: boolean;
}): {
    orientation: string;
    vertices: Float32Array;
    normal: Float32Array;
    uv: Float32Array;
    indices: Uint16Array | Uint32Array;
}[] | {
    vertices: Float32Array;
    normal: Float32Array;
    uv: Float32Array;
    indices: Uint16Array | Uint32Array;
};
export function createFullscreenQuad(): {
    vertices: Float32Array;
    uv: Float32Array;
};
export function createSphere({ radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength, }?: {
    radius?: number;
    widthSegments?: number;
    heightSegments?: number;
    phiStart?: number;
    phiLength?: number;
    thetaStart?: number;
    thetaLength?: number;
}): {
    vertices: Float32Array;
    normal: Float32Array;
    uv: Float32Array;
    indices: Uint16Array | Uint32Array;
};
