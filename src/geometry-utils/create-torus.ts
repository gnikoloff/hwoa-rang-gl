import { vec3 } from 'gl-matrix'

interface Torus {
  /**
   * @defaultValue 0.5
   */
  radius?: number
  /**
   * @defaultValue 0.35
   */
  tube?: number
  /**
   * @defaultValue Math.PI * 2
   */
  arc?: number
  /**
   * @defaultValue Math.PI * 2
   */
  radialSegments?: 8
  /**
   * @defaultValue Math.PI * 2
   */
  tubularSegments?: 6
}

/**
 * @description Generate torus geometry
 * @param {Torus} params
 * @returns {{ vertices, normal, uv, indices }}
 */
export function createTorus (params: Torus = {}) {
  const {
    radius = 0.5,
    tube = 0.35,
    arc = Math.PI * 2,
    radialSegments: inputRadialSegments = 8,
    tubularSegments: inputTubularSegments = 6,
  } = params

  const radialSegments = Math.floor(inputRadialSegments)
  const tubularSegments = Math.floor(inputTubularSegments)

  const indices: number[] = []
  const vertices: number[] = []
  const normals: number[] = []
  const uvs: number[] = []

  const center = vec3.create()
  const vertex = vec3.create()
  const normal = vec3.create()

  for ( let j = 0; j <= radialSegments; j ++ ) {

    for ( let i = 0; i <= tubularSegments; i ++ ) {

      const u = i / tubularSegments * arc
      const v = j / radialSegments * Math.PI * 2

      // vertex

      vertex[0] = ( radius + tube * Math.cos( v ) ) * Math.cos( u )
      vertex[1] = ( radius + tube * Math.cos( v ) ) * Math.sin( u )
      vertex[2] = tube * Math.sin( v )

      vertices.push(vertex[0], vertex[1], vertex[2])

      // normal

      center[0] = radius * Math.cos( u )
      center[1] = radius * Math.sin( u )

      vec3.sub(normal, vertex, center)
      vec3.normalize(normal, normal)

      normals.push(normal[0], normal[1], normal[0])

      // uv

      uvs.push(i / tubularSegments, j / radialSegments)

    }

  }

  // generate indices

  for ( let j = 1; j <= radialSegments; j ++ ) {

    for ( let i = 1; i <= tubularSegments; i ++ ) {

      // indices

      const a = ( tubularSegments + 1 ) * j + i - 1
      const b = ( tubularSegments + 1 ) * ( j - 1 ) + i - 1
      const c = ( tubularSegments + 1 ) * ( j - 1 ) + i
      const d = ( tubularSegments + 1 ) * j + i

      // faces

      indices.push( a, b, d );
      indices.push( b, c, d );

    }

  }

  const num = (radialSegments + 1) * (tubularSegments + 1)

  return {
    indices: num > 65536 ? new Uint32Array(indices) : new Uint16Array(indices),
    vertices: new Float32Array(vertices),
    normal: new Float32Array(normals),
    uv: new Float32Array(uvs),
  }
}