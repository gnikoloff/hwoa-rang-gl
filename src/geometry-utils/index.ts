import { vec3 } from 'gl-matrix'

import { BoxInterface, PlaneInterface, SphereInterface } from '../types'

/**
 * @private
 */
function buildPlane(
  vertices,
  normal,
  uv,
  indices,
  width,
  height,
  depth,
  wSegs,
  hSegs,
  u = 0,
  v = 1,
  w = 2,
  uDir = 1,
  vDir = -1,
  i = 0,
  ii = 0,
) {
  const io = i
  const segW = width / wSegs
  const segH = height / hSegs

  for (let iy = 0; iy <= hSegs; iy++) {
    let y = iy * segH - height / 2
    for (let ix = 0; ix <= wSegs; ix++, i++) {
      let x = ix * segW - width / 2

      vertices[i * 3 + u] = x * uDir
      vertices[i * 3 + v] = y * vDir
      vertices[i * 3 + w] = depth / 2

      normal[i * 3 + u] = 0
      normal[i * 3 + v] = 0
      normal[i * 3 + w] = depth >= 0 ? 1 : -1

      uv[i * 2] = ix / wSegs
      uv[i * 2 + 1] = 1 - iy / hSegs

      if (iy === hSegs || ix === wSegs) continue
      let a = io + ix + iy * (wSegs + 1)
      let b = io + ix + (iy + 1) * (wSegs + 1)
      let c = io + ix + (iy + 1) * (wSegs + 1) + 1
      let d = io + ix + iy * (wSegs + 1) + 1

      indices[ii * 6] = a
      indices[ii * 6 + 1] = b
      indices[ii * 6 + 2] = d
      indices[ii * 6 + 3] = b
      indices[ii * 6 + 4] = c
      indices[ii * 6 + 5] = d
      ii++
    }
  }
}

/**
 * Generates geometry data for a quad
 * @param {PlaneInterface} params
 * @returns {{ vertices, normal, uv, indices }}
 */
export function createPlane(params: PlaneInterface = {}) {
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

export function createBox(params: BoxInterface = {}) {
  const {
    width = 1,
    height = 1,
    depth = 1,
    widthSegments = 1,
    heightSegments = 1,
    depthSegments = 1,
    separateFaces = false,
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

  const sidesData = []

  let i = 0
  let ii = 0

  {
    // RIGHT
    if (separateFaces) {
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
        orientation: 'right',
        vertices,
        normal,
        uv,
        indices,
      })
    } else {
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
  }
  {
    // LEFT
    if (separateFaces) {
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
        orientation: 'left',
        vertices,
        normal,
        uv,
        indices,
      })
    } else {
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
  }
  {
    // TOP
    if (separateFaces) {
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
        orientation: 'top',
        vertices,
        normal,
        uv,
        indices,
      })
    } else {
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
  }
  {
    // BOTTOM
    if (separateFaces) {
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
        orientation: 'bottom',
        vertices,
        normal,
        uv,
        indices,
      })
    } else {
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
  }
  {
    // BACK
    if (separateFaces) {
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
        orientation: 'back',
        vertices,
        normal,
        uv,
        indices,
      })
    } else {
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
  }
  {
    // FRONT
    if (separateFaces) {
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
        orientation: 'front',
        vertices,
        normal,
        uv,
        indices,
      })
    } else {
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
  }

  if (separateFaces) {
    return sidesData
  } else {
    return {
      vertices,
      normal,
      uv,
      indices,
    }
  }
}

/**
 * Generates geometry data for a fullscreen quad in normalized coordinates
 * @param {SphereInterface} params
 * @returns {{ vertices, uv }}
 */
export function createFullscreenQuad() {
  return {
    vertices: new Float32Array([1, 1, -1, 1, -1, -1, -1, -1, 1, -1, 1, 1]),
    uv: new Float32Array([1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1]),
  }
}

/**
 * Generates geometry data for a sphere
 * @param {SphereInterface} params
 * @returns {{ vertices, normal, uv, indices }}
 */
export function createSphere(params: SphereInterface = {}) {
  const {
    radius = 0.5,
    widthSegments = 16,
    heightSegments = Math.ceil(widthSegments * 0.5),
    phiStart = 0,
    phiLength = Math.PI * 2,
    thetaStart = 0,
    thetaLength = Math.PI,
  } = params

  const wSegs = widthSegments
  const hSegs = heightSegments
  const pStart = phiStart
  const pLength = phiLength
  const tStart = thetaStart
  const tLength = thetaLength

  const num = (wSegs + 1) * (hSegs + 1)
  const numIndices = wSegs * hSegs * 6

  const position = new Float32Array(num * 3)
  const normal = new Float32Array(num * 3)
  const uv = new Float32Array(num * 2)
  const index =
    num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices)

  let i = 0
  let iv = 0
  let ii = 0
  let te = tStart + tLength
  const grid = []

  let n = vec3.create()

  for (let iy = 0; iy <= hSegs; iy++) {
    let vRow = []
    let v = iy / hSegs
    for (let ix = 0; ix <= wSegs; ix++, i++) {
      let u = ix / wSegs
      let x =
        -radius *
        Math.cos(pStart + u * pLength) *
        Math.sin(tStart + v * tLength)
      let y = radius * Math.cos(tStart + v * tLength)
      let z =
        radius * Math.sin(pStart + u * pLength) * Math.sin(tStart + v * tLength)

      position[i * 3] = x
      position[i * 3 + 1] = y
      position[i * 3 + 2] = z

      vec3.set(n, x, y, z)
      vec3.normalize(n, n)

      normal[i * 3] = n[0]
      normal[i * 3 + 1] = n[1]
      normal[i * 3 + 2] = n[2]

      uv[i * 2] = u
      uv[i * 2 + 1] = 1 - v

      vRow.push(iv++)
    }

    grid.push(vRow)
  }

  for (let iy = 0; iy < hSegs; iy++) {
    for (let ix = 0; ix < wSegs; ix++) {
      let a = grid[iy][ix + 1]
      let b = grid[iy][ix]
      let c = grid[iy + 1][ix]
      let d = grid[iy + 1][ix + 1]

      if (iy !== 0 || tStart > 0) {
        index[ii * 3] = a
        index[ii * 3 + 1] = b
        index[ii * 3 + 2] = d
        ii++
      }
      if (iy !== hSegs - 1 || te < Math.PI) {
        index[ii * 3] = b
        index[ii * 3 + 1] = c
        index[ii * 3 + 2] = d
        ii++
      }
    }
  }
  return {
    vertices: position,
    normal,
    uv,
    indices: index,
  }
}