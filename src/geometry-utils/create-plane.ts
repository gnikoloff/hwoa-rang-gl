import { buildPlane } from './build-plane'

export interface Plane {
  /**
   * @defaultValue 1
   */
  width?: number
  /**
   * @defaultValue 1
   */
  height?: number
  /**
   * @defaultValue 1
   */
  widthSegments?: number
  /**
   * @defaultValue 1
   */
  heightSegments?: number
}

/**
 * Generates geometry data for a quad
 * @param {PlaneInterface} params
 * @returns {{ vertices, normal, uv, indices }}
 */
export function createPlane(params: Plane = {}) {
  const {
    width = 1,
    height = 1,
    widthSegments = 1,
    heightSegments = 1,
  } = params

  const wSegs = widthSegments
  const hSegs = heightSegments

  // Determine length of arrays
  const num = (wSegs + 1) * (hSegs + 1)
  const numIndices = wSegs * hSegs * 6

  // Generate empty arrays once
  const position = new Float32Array(num * 3)
  const normal = new Float32Array(num * 3)
  const uv = new Float32Array(num * 2)
  const index =
    num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices)

  buildPlane(position, normal, uv, index, width, height, 0, wSegs, hSegs)
  return {
    vertices: position,
    normal,
    uv,
    indices: index,
  }
}
