import { createBox } from './create-box'
import { createBoxSeparateFace } from './create-box-separate-faces'
import { createCircle } from './create-circle'
import { createPlane } from './create-plane'
import { createSphere } from './create-sphere'
import { createTorus } from './create-torus'

export { createBox }
export { createBoxSeparateFace }
export { createCircle }
export { createPlane }
export { createSphere }
export { createTorus }

/**
 * @namespace GeometryUtils
 */
export const GeometryUtils = {
  createBox,
  createBoxSeparateFace,
  createCircle,
  createPlane,
  createSphere,
  createTorus,
}