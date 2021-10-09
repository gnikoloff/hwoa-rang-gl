import { mat4, ReadonlyMat4 } from 'gl-matrix';
import { Transform } from './transform';
/**
 * SceneObject that can have SceneObjects as children. Allows for proper scene graph.
 *
 * @public
 */
export declare class SceneObject extends Transform {
    protected renderable: boolean;
    parentNode: SceneObject | null;
    children: SceneObject[];
    worldMatrix: mat4;
    normalMatrix: mat4;
    setParent: (parentNode?: SceneObject | null) => this;
    updateWorldMatrix: (parentWorldMatrix?: ReadonlyMat4 | null) => this;
    traverseGraph: (callback: any, node?: SceneObject) => this;
}
