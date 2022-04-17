import { createBox } from './create-box'
import { createBoxSeparateFace } from './create-box-separate-faces'
import { createRoundedBox } from './create-rounded-box'
import { createRoundedBoxSeparateFace } from './create-rounded-box-separate-faces'
import { createCircle } from './create-circle'
import { createPlane } from './create-plane'
import { createInterleavedPlane } from './create-interleaved-plane'
import { createSphere } from './create-sphere'
import { createTorus } from './create-torus'

export { createBox }
export { createBoxSeparateFace }
export { createRoundedBoxSeparateFace }
export { createRoundedBox }
export { createCircle }
export { createPlane }
export { createInterleavedPlane }
export { createSphere }
export { createTorus }

/**
 * @namespace GeometryUtils
 */
export const GeometryUtils = {
  createBox,
  createBoxSeparateFace,
  createRoundedBoxSeparateFace,
  createRoundedBox,
  createCircle,
  createPlane,
  createInterleavedPlane,
  createSphere,
  createTorus,
}
