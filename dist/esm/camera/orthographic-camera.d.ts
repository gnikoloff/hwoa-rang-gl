export default class PerspectiveCamera {
    static UP_VECTOR: number[];
    constructor(gl: any, fieldOfView: any, aspect: any, near: any, far: any);
    _gl: any;
    _position: number[];
    _projectionMatrix: mat4;
    _modelViewMatrix: mat4;
    get projectionMatrix(): mat4;
    get modelViewMatrix(): mat4;
    set position(arg: any);
    lookAt(target: any): void;
}
import { mat4 } from "gl-matrix";
