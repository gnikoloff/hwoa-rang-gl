import { createBox } from './create-box';
import { createBoxSeparateFace } from './create-box-separate-faces';
import { createRoundedBox } from './create-rounded-box';
import { createRoundedBoxSeparateFace } from './create-rounded-box-separate-faces';
import { createCircle } from './create-circle';
import { createPlane } from './create-plane';
import { createSphere } from './create-sphere';
import { createTorus } from './create-torus';
export { createBox };
export { createBoxSeparateFace };
export { createRoundedBoxSeparateFace };
export { createRoundedBox };
export { createCircle };
export { createPlane };
export { createSphere };
export { createTorus };
/**
 * @namespace GeometryUtils
 */
export declare const GeometryUtils: {
    createBox: typeof createBox;
    createBoxSeparateFace: typeof createBoxSeparateFace;
    createRoundedBoxSeparateFace: ({ width, height, depth, radius, div, }: {
        width?: number | undefined;
        height?: number | undefined;
        depth?: number | undefined;
        radius?: number | undefined;
        div?: number | undefined;
    }) => never[];
    createRoundedBox: ({ width, height, depth, radius, div, }: {
        width?: number | undefined;
        height?: number | undefined;
        depth?: number | undefined;
        radius?: number | undefined;
        div?: number | undefined;
    }) => {
        vertices: Float32Array;
        normal: Float32Array;
        uv: Float32Array;
        indices: Uint16Array;
    };
    createCircle: typeof createCircle;
    createPlane: typeof createPlane;
    createSphere: typeof createSphere;
    createTorus: typeof createTorus;
};
