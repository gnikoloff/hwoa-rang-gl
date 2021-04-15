import { vec2, vec3 } from 'gl-matrix'

interface Circle {
  /**
   * @default 1
   */
  radius?: number
  /**
   * @default 8
   */
  segments?: number
  /**
   * @default 0
   */
  thetaStart?: number
  /**
   * @default Math.PI * 2
   */
  thetaLength?: number
}

/**
 * @description Generate circle geometry
 * @param {Circle} params
 * @returns {{ vertices, normal, uv, indices }}
 */
export function createCircle (params: Circle = {}) {
  const {
    radius = 1,
    segments = 8,
    thetaStart = 0,
    thetaLength = Math.PI * 2,
  } = params

  const indices: number[] = []
  const vertices: number[] = []
  const normals: number[] = []
  const uvs: number[] = []

  // helper variables

  const vertex = vec3.create()
  const uv = vec2.create()

  // center point

  vertices.push( 0, 0, 0 )
  normals.push( 0, 0, 1 )
  uvs.push( 0.5, 0.5 )

  for ( let s = 0, i = 3; s <= segments; s ++, i += 3 ) {

    const segment = thetaStart + s / segments * thetaLength

    // vertex

    vertex[0] = radius * Math.cos( segment )
    vertex[1] = radius * Math.sin( segment )

    vertices.push(...vertex)

    // normal

    normals.push( 0, 0, 1 )

    // uvs

    uv[0] = ( vertices[ i ] / radius + 1 ) / 2
    uv[1] = ( vertices[ i + 1 ] / radius + 1 ) / 2
    uvs.push( uv[0], uv[1] )

  }

  // indices

  for ( let i = 1; i <= segments; i ++ ) {

    indices.push( i, i + 1, 0 )

  }


  return {
    indices: segments > 65536 ? new Uint32Array(indices) : new Uint16Array(indices),
    vertices: new Float32Array(vertices),
    normal: new Float32Array(normals),
    uv: new Float32Array(uvs),
  }

}
