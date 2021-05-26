// @ts-nocheck

/*
  ROUNDED BOX GEOMETRY

  This method is courtesy of @SketchpunkLabs
  Taken from https://sketchpunk.bitbucket.io/src/fungi_v5_5/016_round_cube_edge.html
*/

import { vec3 } from 'gl-matrix'
import { normalizeNumber, triangleWave } from '../utils/math'
import { VRot90 } from './create-rounded-box'

export const createRoundedBoxSeparateFace = ({
  width = 1,
  height = 1,
  depth = 1,
  radius = 0.5,
  div = 4,
}) => {
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const panel = edge_grid(width, height, depth, radius, div) // Create

  const sidesData = []

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // TODO, Knowing the Plane's Vert Count, It would be better to pre-allocate all the space
  // in TypedArrays then fill in all the data. Using Javascript arrays makes things simple
  // for programming but isn't as efficent.

  // Rotate and Merge the Panel Data into one Geo to form a Rounded Quad

  let geo = {
    verts: [],
    indices: [],
    uv: [],
    norm: [],
  }
  geo_rot_merge(geo, panel, (v, o) => {
    o[0] = v[0]
    o[1] = v[1]
    o[2] = v[2]
    return o
  }) // Top - No Rotation, Kind of a Waste
  sidesData.push({
    orientation: 'top',
    vertices: new Float32Array(geo.verts),
    normal: new Float32Array(geo.norm),
    uv: new Float32Array(geo.uv),
    indices: new Uint16Array(geo.indices),
  })

  geo = {
    verts: [],
    indices: [],
    uv: [],
    norm: [],
  }
  geo_rot_merge(geo, panel, VRot90.xp) // Front
  sidesData.push({
    orientation: 'front',
    vertices: new Float32Array(geo.verts),
    normal: new Float32Array(geo.norm),
    uv: new Float32Array(geo.uv),
    indices: new Uint16Array(geo.indices),
  })

  geo = {
    verts: [],
    indices: [],
    uv: [],
    norm: [],
  }
  geo_rot_merge(geo, panel, VRot90.xp_yp) // Left
  sidesData.push({
    orientation: 'left',
    vertices: new Float32Array(geo.verts),
    normal: new Float32Array(geo.norm),
    uv: new Float32Array(geo.uv),
    indices: new Uint16Array(geo.indices),
  })

  geo = {
    verts: [],
    indices: [],
    uv: [],
    norm: [],
  }
  geo_rot_merge(geo, panel, VRot90.xp_yp_yp) // Back
  sidesData.push({
    orientation: 'back',
    vertices: new Float32Array(geo.verts),
    normal: new Float32Array(geo.norm),
    uv: new Float32Array(geo.uv),
    indices: new Uint16Array(geo.indices),
  })

  geo = {
    verts: [],
    indices: [],
    uv: [],
    norm: [],
  }
  geo_rot_merge(geo, panel, VRot90.xp_yn) // Right
  sidesData.push({
    orientation: 'right',
    vertices: new Float32Array(geo.verts),
    normal: new Float32Array(geo.norm),
    uv: new Float32Array(geo.uv),
    indices: new Uint16Array(geo.indices),
  })

  geo = {
    verts: [],
    indices: [],
    uv: [],
    norm: [],
  }
  geo_rot_merge(geo, panel, VRot90.xp_xp) // Bottom
  sidesData.push({
    orientation: 'bottom',
    vertices: new Float32Array(geo.verts),
    normal: new Float32Array(geo.norm),
    uv: new Float32Array(geo.uv),
    indices: new Uint16Array(geo.indices),
  })

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  return sidesData
}

// Generate a Plane where all its vertices are focus onto the corners
// Then those corners are sphere-ified to create rounded corners on the plane
function edge_grid(width = 2, height = 2, depth = 2, radius = 0.5, div = 4) {
  const mx = width / 2,
    my = height / 2,
    mz = depth / 2,
    len = div * 2

  const verts = []
  const uv = []
  const norm = []
  const v = vec3.create()

  let bit, j, i, t, s, x, y, z

  y = my

  // Use corners kinda like Marching Squares
  const corners = [
    vec3.fromValues(radius - mx, my - radius, radius - mz),
    vec3.fromValues(mx - radius, my - radius, radius - mz),
    vec3.fromValues(radius - mx, my - radius, mz - radius),
    vec3.fromValues(mx - radius, my - radius, mz - radius),
  ]

  const row = (z, zbit) => {
    let t, bit
    const uv_z = normalizeNumber(-mz, mz, z) // Map Z and Normalize the Value

    for (i = 0; i <= len; i++) {
      bit = i <= div ? 0 : 1
      t = triangleWave(i / div) // 0 > 1 > 0
      s = i <= div ? -1 : 1 // Sign
      x = mx * s + radius * t * -s // Flip Signs based if i <= div

      vec3.set(v, x, y, z)
      vec3.sub(v, v, corners[bit | zbit])
      vec3.normalize(v, v)

      norm.push(v[0], v[1], v[2]) // Save it

      vec3.scale(v, v, radius)
      vec3.add(v, v, corners[bit | zbit])

      verts.push(v[0], v[1], v[2]) // Save Vert
      uv.push(normalizeNumber(-mx, mx, x), uv_z)
      //App.Debug.pnt( v );

      // Start the mirror side when done with the first side
      if (t == 1) {
        vec3.set(v, mx - radius, y, z)
        vec3.sub(v, v, corners[1 | zbit])
        vec3.normalize(v, v)
        norm.push(v[0], v[1], v[2])
        vec3.scale(v, v, radius)
        vec3.add(v, v, corners[1 | zbit])

        verts.push(v[0], v[1], v[2])
        uv.push(normalizeNumber(-mx, mx, mx - radius), uv_z)
        // App.Debug.pnt( v );
      }
    }
  }

  for (j = 0; j <= len; j++) {
    // Compute Z Position
    bit = j <= div ? 0 : 2
    t = triangleWave(j / div) // 0 > 1 > 0
    s = j <= div ? -1 : 1 // Sign
    z = mz * s + radius * t * -s // Flip Signs based if i <= div

    row(z, bit) // Draw Row
    if (t == 1) row(mz - radius, 2) // Start Mirror Side
  }

  return { verts, uv, norm, indices: grid_tri_idx(len + 1, len + 1) }
}

// Rotate Vertices/Normals, then Merge All the Vertex Attributes into One Geo
function geo_rot_merge(geo, obj, fn_rot) {
  const offset = geo.verts.length / 3
  const len = obj.verts.length
  const v = vec3.create(),
    o = vec3.create()

  for (let i = 0; i < len; i += 3) {
    // Rotate Vertices
    vec3.set(v, obj.verts[i], obj.verts[i + 1], obj.verts[i + 2])
    fn_rot(v, o)
    geo.verts.push(o[0], o[1], o[2])

    // Rotate Normal
    vec3.set(v, obj.norm[i], obj.norm[i + 1], obj.norm[i + 2])
    fn_rot(v, o)
    geo.norm.push(o[0], o[1], o[2])
  }

  for (const v of obj.uv) {
    geo.uv.push(v)
  }
  for (const v of obj.indices) {
    geo.indices.push(offset + v)
  }
}

// Generate Indices for a Grid Mesh
function grid_tri_idx(x_cells, y_cells) {
  let ary = [],
    col_cnt = x_cells + 1,
    x,
    y,
    a,
    b,
    c,
    d

  for (y = 0; y < y_cells; y++) {
    for (x = 0; x < x_cells; x++) {
      a = y * col_cnt + x
      b = a + col_cnt
      c = b + 1
      d = a + 1
      ary.push(a, b, c, c, d, a)
    }
  }

  return ary
}
