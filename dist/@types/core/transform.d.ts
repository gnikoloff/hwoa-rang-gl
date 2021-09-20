import { mat4, ReadonlyMat4, vec3 } from 'gl-matrix';
/**
 * Base transform class to handle vectors and matrices
 *
 * @public
 */
export declare class Transform {
    position: vec3;
    rotation: vec3;
    scale: vec3;
    modelMatrix: mat4;
    shouldUpdate: boolean;
    /**
     * @returns {this}
     */
    copyFromMatrix(matrix: ReadonlyMat4): this;
    /**
     * @returns {this}
     */
    setPosition(position: {
        x?: number;
        y?: number;
        z?: number;
    }): this;
    /**
     * Sets scale
     * @returns {this}
     */
    setScale(scale: {
        x?: number;
        y?: number;
        z?: number;
    }): this;
    /**
     * Sets rotation
     * @returns {this}
     */
    setRotation(rotation: {
        x?: number;
        y?: number;
        z?: number;
    }): this;
    /**
     * Update model matrix with scale, rotation and translation
     * @returns {this}
     */
    updateModelMatrix(): this;
}
