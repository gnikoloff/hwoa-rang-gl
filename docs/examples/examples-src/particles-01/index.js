import Stats from 'stats-js'
import throttle from 'lodash.throttle'

import {
  PerspectiveCamera,
  Mesh,
  Geometry,
  UNIFORM_TYPE_FLOAT,
} from '../../../../dist/esm'

const PARTICLE_COUNT = 500

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = Math.min(devicePixelRatio, 2)
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

let oldTime = 0
let spacing = 1
let spacingTarget = spacing
let radius = 10
let radiusTarget = radius

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

const camera = new PerspectiveCamera(
  (45 * Math.PI) / 180,
  innerWidth / innerHeight,
  0.1,
  100,
)
camera.position = [0, 0, 40]
camera.lookAt([0, 0, 0])

const vertexArray = new Float32Array(PARTICLE_COUNT).fill(0)

for (let i = 0; i < PARTICLE_COUNT; i++) {
  vertexArray[i] = i
}

const geometry = new Geometry(gl)
geometry.addAttribute('position', {
  typedArray: vertexArray,
  size: 1,
})

const mesh = new Mesh(gl, {
  geometry,
  vertexShaderSource: `
    uniform float time;
    uniform float spacing;
    uniform float movementMaxRadius;

    attribute vec4 position;

    const vec4 cameraPosition = vec4(0.0, 0.0, 40.0, 1.0);

    void main () {
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(
        sin(time + position.x) * movementMaxRadius,
        cos(time + position.x) * movementMaxRadius,
        cos(time + position.x * spacing * 20.0) * movementMaxRadius,
        position.w
      );

      float dist = distance(cameraPosition, gl_Position);
      gl_PointSize = dist * 0.225 * ${devicePixelRatio}.0;
    }
  `,
  fragmentShaderSource: `
    void main () {
      float dist = distance(gl_PointCoord, vec2(0.5));
      float c = clamp(0.5 - dist, 0.0, 1.0);
      gl_FragColor = vec4(vec3(1.0), c);
    }
  `,
})

mesh.use()
mesh.drawMode = gl.POINTS

document.body.appendChild(canvas)
setInterval(() => {
  spacingTarget = Math.random() * 0.85 + 0.15
  radiusTarget = 5 + Math.random() * 15
}, 5000)
requestAnimationFrame(updateFrame)
sizeCanvas()
window.addEventListener('resize', throttle(resize, 100))

function updateFrame(ts) {
  ts /= 1000
  const dt = ts - oldTime
  oldTime = ts

  stats.begin()

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.9, 0.9, 0.9, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  spacing += (spacingTarget - spacing) * (dt * 20)

  radius += (radiusTarget - radius) * (dt * 10)

  mesh
    .setCamera(camera)
    .setUniform('time', UNIFORM_TYPE_FLOAT, ts)
    .setUniform('spacing', UNIFORM_TYPE_FLOAT, spacing)
    .setUniform('movementMaxRadius', UNIFORM_TYPE_FLOAT, radius)
    .draw()

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
