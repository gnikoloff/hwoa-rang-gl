import { ReadonlyVec3, mat4 } from 'gl-matrix';
export declare class PerspectiveCamera {
    static UP_VECTOR: ReadonlyVec3;
    position: [number, number, number];
    lookAtPosition: [number, number, number];
    projectionMatrix: mat4;
    viewMatrix: mat4;
    zoom: number;
    fieldOfView: number;
    aspect: number;
    near: number;
    far: number;
    constructor(fieldOfView: number, aspect: number, near: number, far: number);
    setPosition({ x, y, z, }: {
        x?: number | undefined;
        y?: number | undefined;
        z?: number | undefined;
    }): this;
    updateViewMatrix(): this;
    updateProjectionMatrix(): this;
    lookAt(target: [number, number, number]): this;
}
