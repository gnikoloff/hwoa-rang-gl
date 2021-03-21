export default class PerspectiveCamera {
    static UP_VECTOR: number[];
    constructor(fieldOfView: any, aspect: any, near: any, far: any);
    position: number[];
    lookAtPosition: number[];
    _projectionMatrix: mat4;
    _viewMatrix: mat4;
    get projectionMatrix(): mat4;
    get viewMatrix(): mat4;
    _position: any;
    updateViewMatrix(): void;
    lookAt(target: any): void;
}
import { mat4 } from "gl-matrix";
