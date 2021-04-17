import Stats from 'stats-js'
import throttle from 'lodash.throttle'

import { vec3, vec4, mat4 } from 'gl-matrix'

import {
  PerspectiveCamera,
  Geometry,
  GeometryUtils,
  InstancedMesh,
} from '../../../../dist/esm'

const BOXES_X_COUNT = 12 
const BOXES_Y_COUNT = 12
const BOXES_COUNT = BOXES_X_COUNT * BOXES_Y_COUNT

const dpr = Math.min(devicePixelRatio, 2)
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

const stats = new Stats()
document.body.appendChild(stats.domElement)

let mouseX = 0
let mouseY = 0

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

const { indices, vertices, uv } = GeometryUtils.createBox()
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
const mesh = new InstancedMesh(gl, {
  geometry,
  instanceCount: BOXES_COUNT,
  vertexShaderSource: `
    attribute vec4 position;
    attribute vec2 uv;
    attribute mat4 instanceModelMatrix;

    varying vec2 v_uv;

    void main () {
      gl_Position = projectionMatrix *
                    viewMatrix *
                    modelMatrix *
                    instanceModelMatrix *
                    position;
      v_uv = uv;
    }
  `,
  fragmentShaderSource: `
    varying vec2 v_uv;
    void main () {
      gl_FragColor = vec4(0.0, v_uv, 1.0);
    }
  `,
})

mesh.use()

const matrix = mat4.create()
const translateVec = vec3.create()
const scaleVec = vec4.create()

document.body.addEventListener('mousemove', (e) => {
  mouseX = (e.pageX / innerWidth) * BOXES_X_COUNT - BOXES_X_COUNT / 2
  mouseY = (1 - e.pageY / innerHeight) * BOXES_Y_COUNT - BOXES_Y_COUNT / 2
})
document.body.addEventListener('touchmove', (e) => {
  e.preventDefault()
  mouseX = (e.changedTouches[0].pageX / innerWidth) * 8 - 4
  mouseY = (1 - e.changedTouches[0].pageY / innerHeight) * 10 - 5
})
document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
sizeCanvas()
window.addEventListener('resize', throttle(resize, 100))

function updateFrame() {
  stats.begin()

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.9, 0.9, 0.9, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  for (let i = 0; i < BOXES_COUNT; i++) {
    const x = (i % BOXES_X_COUNT) - BOXES_X_COUNT / 2
    const y = (i - x) / BOXES_Y_COUNT - BOXES_X_COUNT / 2
    
    const dx = mouseX - x
    const dy = mouseY - y

    const angle = Math.atan2(dx, dy)
    const dist = Math.sqrt(dx * dx + dy * dy)


    mat4.identity(matrix)
    vec3.set(translateVec, x, y, dist * 0.3)
    mat4.translate(matrix, matrix, translateVec)
    mat4.rotateX(matrix, matrix, angle)
    mat4.rotateZ(matrix, matrix, angle)

    const scale = dist * 0.1
    vec3.set(scaleVec, scale, scale, scale)
    mat4.scale(matrix, matrix, scaleVec)
    mesh.setMatrixAt(i, matrix)
  }

  mesh.setCamera(camera).draw()

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
