function buildPlane(vertices, normal, uv, indices, width, height, depth, wSegs, hSegs, u = 0, v = 1, w = 2, uDir = 1, vDir = -1, i = 0, ii = 0) {
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

export function createBox({
  width = 1,
  height = 1,
  depth = 1,
  widthSegments = 1,
  heightSegments = 1,
  depthSegments = 1,
  separateFaces = false,
} = {}) {
  const wSegs = widthSegments
  const hSegs = heightSegments
  const dSegs = depthSegments

  const num = (wSegs + 1) * (hSegs + 1) * 2 + (wSegs + 1) * (dSegs + 1) * 2 + (hSegs + 1) * (dSegs + 1) * 2
  const numIndices = (wSegs * hSegs * 2 + wSegs * dSegs * 2 + hSegs * dSegs * 2) * 6

  const vertices = new Float32Array(num * 3)
  const normal = new Float32Array(num * 3)
  const uv = new Float32Array(num * 2)
  const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices)

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
      const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices)
      buildPlane(vertices, normal, uv, indices, depth, height, width, dSegs, hSegs, 2, 1, 0, -1, -1, i, ii)
      sidesData.push({
        orientation: 'right',
        vertices,
        normal,
        uv,
        indices,
      })
    } else {
      buildPlane(vertices, normal, uv, indices, depth, height, width, dSegs, hSegs, 2, 1, 0, -1, -1, i, ii)
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
      const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices)
      buildPlane(vertices, normal, uv, indices, depth, height, -width, dSegs, hSegs, 2, 1, 0, 1, -1, i, ii)
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
        (ii += dSegs * hSegs)
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
      const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices)
      buildPlane(vertices, normal, uv, indices, width, depth, height, dSegs, hSegs, 0, 2, 1, 1, 1, i, ii)
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
        (ii += dSegs * hSegs)
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
      const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices)
      buildPlane(vertices, normal, uv, indices, width, depth, -height, dSegs, hSegs, 0, 2, 1, 1, -1, i, ii)
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
        (ii += wSegs * dSegs)
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
      const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices)
      buildPlane(vertices, normal, uv, indices, width, height, -depth, wSegs, hSegs, 0, 1, 2, -1, -1, i, ii)
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
        (ii += wSegs * dSegs)
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
      const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices)
      buildPlane(vertices, normal, uv, indices, width, height, depth, wSegs, hSegs, 0, 1, 2, 1, -1, i, ii)
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
        (ii += wSegs * hSegs)
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

export function createFullscreenQuad() {
  return {
    vertices: new Float32Array([1, 1, -1, 1, -1, -1, -1, -1, 1, -1, 1, 1]),
    uvs: new Float32Array([1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1]),
  }
}
