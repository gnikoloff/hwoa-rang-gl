import Stats from 'stats-js'

import {
  PerspectiveCamera,
  CameraController,
  Geometry,
  GeometryUtils,
  Mesh,
} from '../../../../dist/esm'

const MOBILE_VIEWPORT = 600

const regularVertexShader = `

  attribute vec4 position;
  attribute vec2 uv;

  varying vec2 v_uv;

  void main () {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
    v_uv = uv;
  }
`
const regularFragmentShader = `
  varying vec2 v_uv;
  void main () {
    gl_FragColor = vec4(v_uv, 0.0, 1.0);
  }
`

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = devicePixelRatio
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

let oldTime = 0

let boxMesh
let lineMesh
let sphereMesh
let planeMesh

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
gl.enable(gl.DEPTH_TEST)
// gl.enable(gl.CULL_FACE)
gl.depthFunc(gl.LEQUAL)

const camera = new PerspectiveCamera(
  (45 * Math.PI) / 180,
  innerWidth / innerHeight,
  0.1,
  100,
)
camera.position = [0, 0, 10]
camera.lookAt([0, 0, 0])

new CameraController(camera, canvas)

/* --------- Box Geometry --------- */
{
  const { indices, vertices, uv } = GeometryUtils.createBox()
  const boxGeometry = new Geometry(gl)
  boxGeometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', {
      typedArray: vertices,
      size: 3,
    })
    .addAttribute('uv', {
      typedArray: uv,
      size: 2,
    })

  boxMesh = new Mesh(gl, {
    geometry: boxGeometry,
    vertexShaderSource: regularVertexShader,
    fragmentShaderSource: regularFragmentShader,
  })
  if (innerWidth < MOBILE_VIEWPORT) {
    boxMesh.setPosition({ y: -2 })
  } else {
    boxMesh.setPosition({ x: -2 })
  }
}

/* --------- Line Geometry --------- */
{
  const lineVerticesCount = 30
  const step = (Math.PI * 2) / lineVerticesCount
  const lineVertices = new Float32Array(lineVerticesCount * 2)
  for (let i = 0; i < lineVerticesCount; i++) {
    const currStep = i * step
    lineVertices[i * 2 + 0] = Math.sin(currStep) * 0.5
    lineVertices[i * 2 + 1] = Math.cos(currStep) * 0.5
  }
  const lineGeometry = new Geometry(gl)
  lineGeometry.addAttribute('position', {
    typedArray: lineVertices,
    size: 2,
  })
  lineMesh = new Mesh(gl, {
    geometry: lineGeometry,
    vertexShaderSource: `
    attribute vec4 position;
    void main () {
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
    }
  `,
    fragmentShaderSource: `
    void main () {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
  `,
  })
  lineMesh.drawMode = gl.LINE_LOOP

  if (innerWidth < MOBILE_VIEWPORT) {
    lineMesh.setPosition({ y: -0.75 })
  } else {
    lineMesh.setPosition({ x: -0.75 })
  }
}

/* --------- Sphere Geometry --------- */
{
  const { indices, vertices, uv } = GeometryUtils.createSphere({
    widthSegments: 30,
    heightSegments: 30,
  })
  const geometry = new Geometry(gl)
  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', {
      typedArray: vertices,
      size: 3,
    })
    .addAttribute('uv', {
      typedArray: uv,
      size: 2,
    })
  sphereMesh = new Mesh(gl, {
    geometry,
    vertexShaderSource: regularVertexShader,
    fragmentShaderSource: regularFragmentShader,
  })
  if (innerWidth < MOBILE_VIEWPORT) {
    sphereMesh.setPosition({ y: 0.75 })
  } else {
    sphereMesh.setPosition({ x: 0.75 })
  }
}

/* --------- Plane Geometry --------- */
{
  const { indices, vertices, uv } = GeometryUtils.createPlane()
  const geometry = new Geometry(gl)
  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', {
      typedArray: vertices,
      size: 3,
    })
    .addAttribute('uv', {
      typedArray: uv,
      size: 2,
    })
  planeMesh = new Mesh(gl, {
    geometry,
    vertexShaderSource: regularVertexShader,
    fragmentShaderSource: regularFragmentShader,
  })
  if (innerWidth < MOBILE_VIEWPORT) {
    planeMesh.setPosition({ y: 2 })
  } else {
    planeMesh.setPosition({ x: 2 })
  }
}

document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
resize()
window.addEventListener('resize', resize)

function updateFrame(ts) {
  ts /= 1000
  const dt = ts - oldTime
  oldTime = ts

  stats.begin()

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.9, 0.9, 0.9, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  boxMesh.use().setCamera(camera).draw()

  lineMesh.use().setCamera(camera).draw()

  sphereMesh.use().setCamera(camera).draw()

  planeMesh.use().setCamera(camera).draw()

  stats.end()

  requestAnimationFrame(updateFrame)
}

function resize() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}
