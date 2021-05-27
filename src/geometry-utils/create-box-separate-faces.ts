import {
  CUBE_SIDE_BACK,
  CUBE_SIDE_BOTTOM,
  CUBE_SIDE_FRONT,
  CUBE_SIDE_LEFT,
  CUBE_SIDE_RIGHT,
  CUBE_SIDE_TOP,
} from '../utils/gl-constants'
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
}

/**
 * Generates geometry data for a box
 * @param {Box} params
 * @returns {[{ vertices, normal, uv, indices, orientation }]}
 */
export function createBoxSeparateFace(params: Box = {}) {
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

  const sidesData: any[] = []

  const i = 0
  const ii = 0

  {
    // RIGHT
    const num = (dSegs + 1) * (hSegs + 1)
    const numIndices = dSegs * hSegs * 6
    const vertices = new Float32Array(num * 3)
    const normal = new Float32Array(num * 3)
    const uv = new Float32Array(num * 2)
    const indices =
      num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices)
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
    sidesData.push({
      orientation: CUBE_SIDE_RIGHT,
      vertices,
      normal,
      uv,
      indices,
    })
  }
  {
    // LEFT
    const num = (dSegs + 1) * (hSegs + 1)
    const numIndices = dSegs * hSegs * 6
    const vertices = new Float32Array(num * 3)
    const normal = new Float32Array(num * 3)
    const uv = new Float32Array(num * 2)
    const indices =
      num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices)
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
      i,
      ii,
    )
    sidesData.push({
      orientation: CUBE_SIDE_LEFT,
      vertices,
      normal,
      uv,
      indices,
    })
  }
  {
    // TOP
    const num = (dSegs + 1) * (hSegs + 1)
    const numIndices = dSegs * hSegs * 6
    const vertices = new Float32Array(num * 3)
    const normal = new Float32Array(num * 3)
    const uv = new Float32Array(num * 2)
    const indices =
      num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices)
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
      i,
      ii,
    )
    sidesData.push({
      orientation: CUBE_SIDE_TOP,
      vertices,
      normal,
      uv,
      indices,
    })
  }
  {
    // BOTTOM
    const num = (dSegs + 1) * (hSegs + 1)
    const numIndices = dSegs * hSegs * 6
    const vertices = new Float32Array(num * 3)
    const normal = new Float32Array(num * 3)
    const uv = new Float32Array(num * 2)
    const indices =
      num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices)
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
      i,
      ii,
    )
    sidesData.push({
      orientation: CUBE_SIDE_BOTTOM,
      vertices,
      normal,
      uv,
      indices,
    })
  }
  {
    // BACK
    const num = (wSegs + 1) * (dSegs + 1)
    const numIndices = wSegs * dSegs * 6
    const vertices = new Float32Array(num * 3)
    const normal = new Float32Array(num * 3)
    const uv = new Float32Array(num * 2)
    const indices =
      num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices)
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
      i,
      ii,
    )
    sidesData.push({
      orientation: CUBE_SIDE_BACK,
      vertices,
      normal,
      uv,
      indices,
    })
  }
  {
    // FRONT
    const num = (wSegs + 1) * (hSegs + 1)
    const numIndices = wSegs * hSegs * 6
    const vertices = new Float32Array(num * 3)
    const normal = new Float32Array(num * 3)
    const uv = new Float32Array(num * 2)
    const indices =
      num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices)
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
      i,
      ii,
    )
    sidesData.push({
      orientation: CUBE_SIDE_FRONT,
      vertices,
      normal,
      uv,
      indices,
    })
  }

  return sidesData
}
