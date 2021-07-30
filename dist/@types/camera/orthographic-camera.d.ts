import { ReadonlyVec3, mat4 } from 'gl-matrix';
export declare class OrthographicCamera {
    static UP_VECTOR: ReadonlyVec3;
    left: number;
    right: number;
    top: number;
    bottom: number;
    near: number;
    far: number;
    zoom: number;
    position: [number, number, number];
    lookAtPosition: [number, number, number];
    projectionMatrix: mat4;
    viewMatrix: mat4;
    constructor(left: number, right: number, top: number, bottom: number, near: number, far: number);
    setPosition({ x, y, z }: {
        x?: number | undefined;
        y?: number | undefined;
        z?: number | undefined;
    }): void;
    updateViewMatrix(): this;
    updateProjectionMatrix(): this;
    lookAt(target: [number, number, number]): this;
}
