/**
 * @private
 */
export function buildPlane(
  vertices: Float32Array,
  normal: Float32Array,
  uv: Float32Array,
  indices: Uint16Array|Uint32Array,
  width: number,
  height: number,
  depth: number,
  wSegs: number,
  hSegs: number,
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
    const y = iy * segH - height / 2
    for (let ix = 0; ix <= wSegs; ix++, i++) {
      const x = ix * segW - width / 2

      vertices[i * 3 + u] = x * uDir
      vertices[i * 3 + v] = y * vDir
      vertices[i * 3 + w] = depth / 2

      normal[i * 3 + u] = 0
      normal[i * 3 + v] = 0
      normal[i * 3 + w] = depth >= 0 ? 1 : -1

      uv[i * 2] = ix / wSegs
      uv[i * 2 + 1] = 1 - iy / hSegs

      if (iy === hSegs || ix === wSegs) continue
      const a = io + ix + iy * (wSegs + 1)
      const b = io + ix + (iy + 1) * (wSegs + 1)
      const c = io + ix + (iy + 1) * (wSegs + 1) + 1
      const d = io + ix + iy * (wSegs + 1) + 1

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