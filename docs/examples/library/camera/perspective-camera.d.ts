import { mat4 } from 'gl-matrix';
export default class PerspectiveCamera {
    static UP_VECTOR: [number, number, number];
    position: [number, number, number];
    lookAtPosition: [number, number, number];
    projectionMatrix: mat4;
    viewMatrix: mat4;
    zoom: number;
    fieldOfView: number;
    aspect: number;
    near: number;
    far: number;
    constructor(fieldOfView: any, aspect: any, near: any, far: any);
    updateViewMatrix(): this;
    updateProjectionMatrix(): this;
    lookAt(target: [number, number, number]): this;
}
