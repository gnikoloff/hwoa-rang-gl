import { buildPlane } from './build-plane'

export interface Box {
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
  depth?: number
  /**
   * @defaultValue 1
   */
  widthSegments?: number
  /**
   * @defaultValue 1
   */
  heightSegments?: number
  /**
   * @defaultValue 1
   */
  depthSegments?: number
  /**
   * @defaultValue false
   */
  separateFaces?: boolean
}

/**
 * Generates geometry data for a box
 * @param {Box} params
 * @returns {{ vertices, normal, uv, indices }}
 */
export function createBox(params: Box = {}) {
  const {
    width = 1,
    height = 1,
    depth = 1,
    widthSegments = 1,
    heightSegments = 1,
    depthSegments = 1,
  } = params

  const wSegs = widthSegments
  const hSegs = heightSegments
  const dSegs = depthSegments

  const num =
    (wSegs + 1) * (hSegs + 1) * 2 +
    (wSegs + 1) * (dSegs + 1) * 2 +
    (hSegs + 1) * (dSegs + 1) * 2
  const numIndices =
    (wSegs * hSegs * 2 + wSegs * dSegs * 2 + hSegs * dSegs * 2) * 6

  const vertices = new Float32Array(num * 3)
  const normal = new Float32Array(num * 3)
  const uv = new Float32Array(num * 2)
  const indices =
    num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices)

  const i = 0
  const ii = 0

  {
    // RIGHT
    buildPlane(
      vertices,
      normal,
      uv,
      indices,
      depth,
      height,
      width,
      dSegs,
      hSegs,
      2,
      1,
      0,
      -1,
      -1,
      i,
      ii,
    )
  }
  {
    // LEFT

    buildPlane(
      vertices,
      normal,
      uv,
      indices,
      depth,
      height,
      -width,
      dSegs,
      hSegs,
      2,
      1,
      0,
      1,
      -1,
      (i += (dSegs + 1) * (hSegs + 1)),
      (ii += dSegs * hSegs),
    )
  }
  {
    // TOP

    buildPlane(
      vertices,
      normal,
      uv,
      indices,
      width,
      depth,
      height,
      dSegs,
      hSegs,
      0,
      2,
      1,
      1,
      1,
      (i += (dSegs + 1) * (hSegs + 1)),
      (ii += dSegs * hSegs),
    )
  }
  {
    // BOTTOM

    buildPlane(
      vertices,
      normal,
      uv,
      indices,
      width,
      depth,
      -height,
      dSegs,
      hSegs,
      0,
      2,
      1,
      1,
      -1,
      (i += (wSegs + 1) * (dSegs + 1)),
      (ii += wSegs * dSegs),
    )
  }
  {
    // BACK

    buildPlane(
      vertices,
      normal,
      uv,
      indices,
      width,
      height,
      -depth,
      wSegs,
      hSegs,
      0,
      1,
      2,
      -1,
      -1,
      (i += (wSegs + 1) * (dSegs + 1)),
      (ii += wSegs * dSegs),
    )
  }

  {
    // FRONT

    buildPlane(
      vertices,
      normal,
      uv,
      indices,
      width,
      height,
      depth,
      wSegs,
      hSegs,
      0,
      1,
      2,
      1,
      -1,
      (i += (wSegs + 1) * (hSegs + 1)),
      (ii += wSegs * hSegs),
    )
  }

  return {
    vertices,
    normal,
    uv,
    indices,
  }
}
