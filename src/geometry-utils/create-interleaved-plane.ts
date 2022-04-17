import { Plane } from './create-plane'

export const createInterleavedPlane = (params: Plane = {}): PlaneGeometry => {
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

  // Generate interleaved array
  const interleavedArray = new Float32Array(num * 3 + num * 2)
  const indicesArray =
    num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices)

  let i = 0
  let ii = 0
  const io = i
  const segW = width / wSegs
  const segH = height / hSegs
  const uDir = 1
  const vDir = -1
  const depth = 0
  // pos + uv
  const vertexStride = 3 + 2

  for (let iy = 0; iy <= hSegs; iy++) {
    const y = iy * segH - height / 2
    for (let ix = 0; ix <= wSegs; ix++, i++) {
      const x = ix * segW - width / 2

      interleavedArray[i * vertexStride + 0] = x * uDir
      interleavedArray[i * vertexStride + 1] = y * vDir
      interleavedArray[i * vertexStride + 2] = depth / 2

      interleavedArray[i * vertexStride + 3] = ix / wSegs
      interleavedArray[i * vertexStride + 4] = 1 - iy / hSegs
      // interleavedArray[i * vertexStride + 4] = flipUVy
      //   ? 1 - iy / hSegs
      //   : iy / hSegs

      if (iy === hSegs || ix === wSegs) continue
      const a = io + ix + iy * (wSegs + 1)
      const b = io + ix + (iy + 1) * (wSegs + 1)
      const c = io + ix + (iy + 1) * (wSegs + 1) + 1
      const d = io + ix + iy * (wSegs + 1) + 1

      indicesArray[ii * 6] = a
      indicesArray[ii * 6 + 1] = b
      indicesArray[ii * 6 + 2] = d
      indicesArray[ii * 6 + 3] = b
      indicesArray[ii * 6 + 4] = c
      indicesArray[ii * 6 + 5] = d
      ii++
    }
  }

  return {
    width,
    height,
    vertexCount: indicesArray.length,
    vertexStride,
    interleavedArray,
    indicesArray,
  }
}

export interface Geometry {
  vertexCount: number
  vertexStride: number
  interleavedArray: Float32Array
  indicesArray: Uint16Array | Uint32Array
}

export interface PlaneGeometry extends Geometry {
  width: number
  height: number
}
