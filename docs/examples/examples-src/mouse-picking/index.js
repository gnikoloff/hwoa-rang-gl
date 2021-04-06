import Stats from 'stats-js'
import { mat4 } from 'gl-matrix'
import throttle from 'lodash.throttle'

import {
  PerspectiveCamera,
  CameraController,
  Geometry,
  GeometryUtils,
  Mesh,
  Framebuffer,
  UNIFORM_TYPE_FLOAT,
  UNIFORM_TYPE_MATRIX4X4,
  UNIFORM_TYPE_VEC4,
} from '../../../../dist/esm'

const SHAPE_COUNT = 50

const vertexShaderSource = `
  attribute vec4 position;
  attribute vec2 uv;

  varying vec2 v_uv;

  void main () {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
    v_uv = uv;
  }
`
const fragmentShaderSource = `
  uniform bool hovered;

  varying vec2 v_uv;

  void main () {
    if (hovered) {
      gl_FragColor = vec4(0.0, 1.0 - v_uv, 1.0);
    } else {
      gl_FragColor = vec4(v_uv, 0.0, 1.0);
    }
  }
`

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = Math.min(devicePixelRatio, 2)
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
const fieldOfViewRadians = (45 * Math.PI) / 180
const near = 0.1
const far = 100
const frustumProjectionMatrix = mat4.create()

let mouseX = -1
let mouseY = -1
let lastHoverId

gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
gl.enable(gl.DEPTH_TEST)
// gl.enable(gl.CULL_FACE)
gl.depthFunc(gl.LEQUAL)

const camera = new PerspectiveCamera(
  fieldOfViewRadians,
  innerWidth / innerHeight,
  near,
  far,
)
camera.position = [0, 0, 40]
camera.lookAt([0, 0, 0])
new CameraController(camera, canvas)

const mousePickTarget = new Framebuffer(gl, {
  width: innerWidth,
  height: innerHeight,
})

const meshes = []
const hoverMeshes = []

const triangleGeometry = new Geometry(gl)
const cubeGeometry = new Geometry(gl)
const sphereGeometry = new Geometry(gl)

const availableGeometries = [triangleGeometry, cubeGeometry, sphereGeometry]

{
  const vertices = new Float32Array([-0.5, -0.5, 0.5, -0.5, 0, 0.5])
  const uvs = new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0])
  triangleGeometry
    .addAttribute('position', { typedArray: vertices, size: 2 })
    .addAttribute('uv', { typedArray: uvs, size: 2 })
}

{
  const { vertices, uv, indices } = GeometryUtils.createBox()
  cubeGeometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', { typedArray: vertices, size: 3 })
    .addAttribute('uv', { typedArray: uv, size: 2 })
}

{
  const { vertices, uv, indices } = GeometryUtils.createSphere()
  sphereGeometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', { typedArray: vertices, size: 3 })
    .addAttribute('uv', { typedArray: uv, size: 2 })
}

for (let i = 0; i < SHAPE_COUNT; ++i) {
  const randGeometry =
    availableGeometries[Math.floor(Math.random() * availableGeometries.length)]

  const mesh = new Mesh(gl, {
    geometry: randGeometry,
    uniforms: {
      hovered: { type: UNIFORM_TYPE_FLOAT, value: 0 },
    },
    vertexShaderSource,
    fragmentShaderSource,
  })
  const scale = 1 + Math.random() * 3

  const randX = (Math.random() * 2 - 1) * 14
  const randY = (Math.random() * 2 - 1) * 14
  const randZ = (Math.random() * 2 - 1) * 14

  const randRotX = (Math.random() * 2 - 1) * (Math.PI * 2)
  const randRotY = (Math.random() * 2 - 1) * (Math.PI * 2)
  const rotAngle = Math.random() * Math.PI

  mesh
    .setScale({ x: scale, y: scale, z: scale })
    .setPosition({ x: randX, y: randY, z: randZ })
    .setRotation({ x: randRotX, y: randRotY }, rotAngle)

  meshes.push(mesh)

  const id = i + 1

  mesh.id = id

  const hoverMesh = new Mesh(gl, {
    geometry: randGeometry,
    uniforms: {
      u_id: {
        type: UNIFORM_TYPE_VEC4,
        value: [
          ((id >> 0) & 0xff) / 0xff,
          ((id >> 8) & 0xff) / 0xff,
          ((id >> 16) & 0xff) / 0xff,
          ((id >> 24) & 0xff) / 0xff,
        ],
      },
    },
    vertexShaderSource,
    fragmentShaderSource: `
      uniform vec4 u_id;
      void main () {
        gl_FragColor = u_id;
      }
    `,
  })

  hoverMesh
    .setScale({ x: scale, y: scale, z: scale })
    .setPosition({ x: randX, y: randY, z: randZ })
    .setRotation({ x: randRotX, y: randRotY }, rotAngle)
  hoverMeshes.push(hoverMesh)
}

document.body.appendChild(canvas)
document.body.addEventListener('mousemove', onMouseMove)
requestAnimationFrame(updateFrame)
sizeCanvas()
window.addEventListener('resize', throttle(resize))

function onMouseMove(e) {
  const rect = canvas.getBoundingClientRect()
  mouseX = e.clientX - rect.left
  mouseY = e.clientY - rect.top
}

function updateFrame(ts) {
  ts /= 1000

  stats.begin()

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.9, 0.9, 0.9, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  const aspect = innerWidth / innerHeight
  const top = Math.tan(fieldOfViewRadians * 0.5) * near
  const bottom = -top
  const left = aspect * bottom
  const right = aspect * top
  const width = Math.abs(right - left)
  const height = Math.abs(top - bottom)

  const pixelX = (mouseX * gl.canvas.width) / gl.canvas.clientWidth
  const pixelY =
    gl.canvas.height - (mouseY * gl.canvas.height) / gl.canvas.clientHeight - 1

  const subLeft = left + (pixelX * width) / gl.canvas.width
  const subBottom = bottom + (pixelY * height) / gl.canvas.height
  const subWidth = 1 / gl.canvas.width
  const subHeight = 1 / gl.canvas.height

  // make a frustum for that 1 pixel
  mat4.frustum(
    frustumProjectionMatrix,
    subLeft,
    subLeft + subWidth,
    subBottom,
    subBottom + subHeight,
    near,
    far,
  )

  meshes.forEach((mesh) => {
    mesh.use().setCamera(camera).draw()
  })

  mousePickTarget.bind()

  gl.viewport(0, 0, 1, 1)

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  hoverMeshes.forEach((mesh) => {
    mesh
      .use()
      .setCamera(camera)
      .setUniform(
        'projectionMatrix',
        UNIFORM_TYPE_MATRIX4X4,
        frustumProjectionMatrix,
      )
      .draw()
  })

  // const pixelX = (mouseX * canvas.width) / innerWidth
  // const pixelY = canvas.height - (mouseY * canvas.height) / innerHeight - 1
  const pixelData = new Uint8Array(4)
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelData)

  const id =
    pixelData[0] +
    (pixelData[1] << 8) +
    (pixelData[2] << 16) +
    (pixelData[3] << 24)
  if (id > 0) {
    if (id !== lastHoverId) {
      meshes.forEach((mesh) => {
        mesh.use().setUniform('hovered', UNIFORM_TYPE_FLOAT, 0)
      })
    }
    const hoverMesh = meshes.find(({ id: ownID }) => ownID === id)
    hoverMesh.use().setUniform('hovered', UNIFORM_TYPE_FLOAT, 1)
    lastHoverId = id
  } else {
    meshes.forEach((mesh) => {
      mesh.use().setUniform('hovered', UNIFORM_TYPE_FLOAT, 0)
    })
  }

  mousePickTarget.unbind()

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
