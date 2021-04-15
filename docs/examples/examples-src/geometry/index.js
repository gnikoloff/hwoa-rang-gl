import Stats from 'stats-js'
import throttle from 'lodash.throttle'

import {
  PerspectiveCamera,
  CameraController,
  Geometry,
  GeometryUtils,
  Mesh,
  Texture,
  UNIFORM_TYPE_INT,
} from '../../../../dist/esm'

const MOBILE_VIEWPORT = 600

const BASE_VERTEX_SHADER = `
  precision highp float;

  attribute vec4 position;
  attribute vec2 uv;

  varying vec2 v_uv;

  void main () {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
    v_uv = uv;
  }
`
const REGULAR_RRAGMENT_SHADER = `
  uniform sampler2D texture;
  
  varying vec2 v_uv;

  void main () {
    gl_FragColor = texture2D(texture, v_uv);
  }
`

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = Math.min(devicePixelRatio, 2)
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

let circleMesh
let torusMesh
let boxMesh
let lineMesh
let sphereMesh
let planeMesh

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

gl.enable(gl.DEPTH_TEST)
gl.depthFunc(gl.LEQUAL)

// gl.enable(gl.CULL_FACE)
// gl.cullFace(gl.FRONT_AND_BACK)

const camera = new PerspectiveCamera(
  (45 * Math.PI) / 180,
  innerWidth / innerHeight,
  0.1,
  100,
)
camera.position = [6.41, 2.46, 4.11]
camera.lookAt([0, 0, 0])

new CameraController(camera, canvas)

const uvDebugTexture = new Texture(gl, {
  minFilter: gl.LINEAR_MIPMAP_LINEAR,
})
  .bind()
  .fromSize(512, 512)
  .generateMipmap()

const image = new Image()
image.onload = () => {
  uvDebugTexture.bind().fromImage(image, 512, 512).generateMipmap()
}

image.src = window.location.href.includes('github')
  ? '/hwoa-rang-gl/examples/dist/assets/textures/UV_Grid_Sm.png'
  : '/examples/dist/assets/textures/UV_Grid_Sm.png'

/* --------- Circle Geometry --------- */
{
  const {
    indices, vertices, uv
  } = GeometryUtils.createCircle()
  const geometry = new Geometry(gl)
  
  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', { typedArray: vertices, size: 3 })
    .addAttribute('uv', { typedArray: uv, size: 2 })
  circleMesh = new Mesh(gl, {
    geometry,
    uniforms: {
      texture: { type: UNIFORM_TYPE_INT, value: 0 },
    },
    vertexShaderSource: BASE_VERTEX_SHADER,
    fragmentShaderSource: REGULAR_RRAGMENT_SHADER,
  })
  circleMesh.setPosition({ x: -3, z: -1 })
}

/* --------- Torus Geometry --------- */
{
  const {
    indices, vertices, uv
  } = GeometryUtils.createTorus()
  const geometry = new Geometry(gl)
  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', { typedArray: vertices, size: 3 })
    .addAttribute('uv', { typedArray: uv, size: 2 })
  torusMesh = new Mesh(gl, {
    geometry,
    uniforms: {
      texture: { type: UNIFORM_TYPE_INT, value: 0 },
    },
    vertexShaderSource: BASE_VERTEX_SHADER,
    fragmentShaderSource: REGULAR_RRAGMENT_SHADER,
  })
  torusMesh.setPosition({ x: 0, z: -1 })
}

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
    uniforms: {
      texture: { type: UNIFORM_TYPE_INT, value: 0 },
    },
    vertexShaderSource: BASE_VERTEX_SHADER,
    fragmentShaderSource: REGULAR_RRAGMENT_SHADER,
  })
  boxMesh.setPosition({ x: -3, z: 1 })
  // if (innerWidth < MOBILE_VIEWPORT) {
  //   boxMesh.setPosition({ y: -2 })
  // } else {
    
  // }
}

/* --------- Line Geometry --------- */
{
  const lineVerticesCount = 30
  const step = (Math.PI * 2) / lineVerticesCount
  const lineVertices = new Float32Array(lineVerticesCount * 2)
  for (let i = 0; i < lineVerticesCount; i++) {
    const currStep = i * step
    lineVertices[i * 2 + 0] = Math.sin(currStep * 2) * 0.5
    lineVertices[i * 2 + 1] = Math.cos(currStep) * 0.5
  }
  const lineGeometry = new Geometry(gl)
  lineGeometry.addAttribute('position', {
    typedArray: lineVertices,
    size: 2,
  })
  lineMesh = new Mesh(gl, {
    geometry: lineGeometry,
    uniforms: {
      texture: { type: UNIFORM_TYPE_INT, value: 0 },
    },
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

  // if (innerWidth < MOBILE_VIEWPORT) {
  //   lineMesh.setPosition({ y: -0.75 })
  // } else {
    
  // }
  lineMesh.setPosition({ x: 0, z: 1 })
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
    uniforms: {
      texture: { type: UNIFORM_TYPE_INT, value: 0 },
    },
    vertexShaderSource: BASE_VERTEX_SHADER,
    fragmentShaderSource: REGULAR_RRAGMENT_SHADER,
  })
  // if (innerWidth < MOBILE_VIEWPORT) {
  //   sphereMesh.setPosition({ y: 0.75 })
  // } else {
    
  // }
  sphereMesh.setPosition({ x: 3, z: 1 })
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
    uniforms: {
      texture: { type: UNIFORM_TYPE_INT, value: 0 },
    },
    vertexShaderSource: BASE_VERTEX_SHADER,
    fragmentShaderSource: REGULAR_RRAGMENT_SHADER,
  })
  // if (innerWidth < MOBILE_VIEWPORT) {
  //   planeMesh.setPosition({ y: 2 })
  // } else {
    
  // }
  planeMesh.setPosition({ x: 3, z: -1 })
}

document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
sizeCanvas()
window.addEventListener('resize', throttle(resize, 100))

function updateFrame(ts) {
  ts /= 1000

  stats.begin()

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.9, 0.9, 0.9, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  gl.activeTexture(gl.TEXTURE0)
  uvDebugTexture.bind()

  const time = ts * 0.25

  boxMesh.use().setRotation({ x: time, y: -time }).setCamera(camera).draw()

  lineMesh.use().setRotation({ y: time, z: time }).setCamera(camera).draw()

  sphereMesh.use().setRotation({ z: time, x: -time }).setCamera(camera).draw()

  planeMesh.use().setRotation({ y: -time, z: time }).setCamera(camera).draw()

  torusMesh.use().setRotation({ x: -time, y: time }).setCamera(camera).draw()

  circleMesh.use().setRotation({ y: -time, z: -time }).setCamera(camera).draw()

  stats.end()

  requestAnimationFrame(updateFrame)
}

function resize() {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()

  sizeCanvas()
}

function sizeCanvas() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}
