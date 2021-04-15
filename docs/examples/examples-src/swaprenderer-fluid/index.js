import Stats from 'stats-js'
import * as dat from 'dat.gui'
import throttle from 'lodash.throttle'
import { vec3, mat4 } from 'gl-matrix'

import {
  getExtension,
  SwapRenderer,
  Geometry,
  InstancedMesh,
  PerspectiveCamera,
  GeometryUtils,
  Framebuffer,
  UNIFORM_TYPE_FLOAT,
  UNIFORM_TYPE_INT,
  UNIFORM_TYPE_VEC2,
} from '../../../../dist/esm'

import baseVert from './base.vert'
import cursorVert from './cursor.vert'
import advectFrag from './advect.frag'
import divergenceFrag from './divergence.frag'
import jacobiFrag from './jacobi.frag'
import subtractPressureGradientFrag from './subtract-pressure-gradient.frag'
import clearFrag from './clear.frag'
import curlShader from './curl.frag'
import vorticityFrag from './vorticity.frag'
import visFrag from './visualise.frag'
import addForceFrag2 from './add-force.frag'

const ITERATIONS_COUNT = 20

const VELOCITY0 = 'velocity0'
const VELOCITY1 = 'velocity1'
const VELOCITY_DIVERGENCE = 'velocityDivergence'
const PRESSURE0 = 'pressure0'
const PRESSURE1 = 'pressure1'
const CURL = 'curl'
const SCENE = 'scene'

const PROGRAM_ADVECT = 'advect'
const PROGRAM_INTERACTION_FORCE = 'interactionForce'
const PROGRAM_DIVERGENCE = 'divergence'
const PROGRAM_JACOBI = 'jacobi'
const PROGRAM_CURL = 'curl'
const PROGRAM_VORTICITY = 'vorticity'
const PROGRAM_CLEAR = 'clear'
const PROGRAM_SUBTRACT_PRESSURE_GRADIENT = 'subtractPressureGradient'
const PROGRAM_VISUALISE = 'visualise'

const PROGRAM_INPUT_TEXTURES = new Map([
  [PROGRAM_CURL, [VELOCITY0]],
  [PROGRAM_VORTICITY, [VELOCITY0, CURL]],
  [PROGRAM_INTERACTION_FORCE, [VELOCITY0]],
  [PROGRAM_DIVERGENCE, [VELOCITY1]],
  [PROGRAM_CLEAR, [PRESSURE0]],
  [PROGRAM_JACOBI, [PRESSURE0, VELOCITY_DIVERGENCE]],
  [PROGRAM_SUBTRACT_PRESSURE_GRADIENT, [PRESSURE0, VELOCITY1]],
  [PROGRAM_ADVECT, [VELOCITY0]],
  [PROGRAM_VISUALISE, [PRESSURE0, VELOCITY0, SCENE]],
])

const config = {
  pressure: 0.8,
  curl: 1,
  scale: 0.99,
  programMode: PROGRAM_VISUALISE,
}

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = Math.min(devicePixelRatio, 2)
const canvas = document.createElement('canvas')
const params = {
  alpha: false,
  antialias: false,
  premultipliedAlpha: false,
  preserveDrawingBuffer: false,
}
const gl =
  canvas.getContext('webgl', params) ||
  canvas.getContext('experimental-webgl', params)

const errorLogWrapper = document.getElementById('error-log')

const gui = new dat.GUI()

// -------------------

let bgWidth
let bgHeight
let px
let px1
let mouse = [0, 0]
let lastMouse = [0, 0]
let targetMouse = [0, 0]
let mouseVelocity = [0, 0]
let hasFloatPointLinearFiltering = false

let drawMesh

gui.add(config, 'pressure').min(0.1).max(1).step(0.05)
gui.add(config, 'curl').min(1).max(20).step(1)
gui
  .add(config, 'scale')
  .min(0.1)
  .max(1)
  .step(0.1)
  .onChange(() => {
    swapRenderer
      .useProgram(PROGRAM_ADVECT)
      .setUniform('scale', UNIFORM_TYPE_FLOAT, config.scale)
  })
gui.add(config, 'programMode', [
  PROGRAM_ADVECT,
  PROGRAM_INTERACTION_FORCE,
  PROGRAM_DIVERGENCE,
  PROGRAM_JACOBI,
  PROGRAM_CURL,
  PROGRAM_VORTICITY,
  PROGRAM_CLEAR,
  PROGRAM_SUBTRACT_PRESSURE_GRADIENT,
  PROGRAM_VISUALISE,
])

const camera = new PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000)
camera.position = [0, 0, 50]
camera.lookAt([0, 0, 0])

{
  const { indices, vertices, uv } = GeometryUtils.createBox({
    width: 10,
    height: 10,
    depth: 10,
  })
  const geometry = new Geometry(gl)
  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', { typedArray: vertices, size: 3 })
    .addAttribute('uv', { typedArray: uv, size: 2 })

  drawMesh = new InstancedMesh(gl, {
    geometry,
    instanceCount: 50,
    vertexShaderSource: `
      attribute vec4 position;
      attribute vec2 uv;
      attribute mat4 instanceModelMatrix;

      varying vec2 v_uv;

      void main () {
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceModelMatrix * position;

        v_uv = uv;
      }
    `,
    fragmentShaderSource: `
      varying vec2 v_uv;

      void main () {
        gl_FragColor = vec4(v_uv, 1.0, 1.0);
      }
    `,
  })

  const transformMatrix = mat4.create()
  const transformVec = vec3.create()

  for (let i = 0; i < drawMesh.instanceCount; i++) {
    const randX = (Math.random() * 2 - 1) * 20
    const randY = (Math.random() * 2 - 1) * 20
    const randZ = (Math.random() * 2 - 1) * 20

    const randScale = 0.6 + Math.random() * 0.4

    mat4.identity(transformMatrix)

    vec3.set(transformVec, randX, randY, randZ)
    mat4.translate(transformMatrix, transformMatrix, transformVec)

    vec3.set(transformVec, randScale, randScale, randScale)
    mat4.scale(transformMatrix, transformMatrix, transformVec)

    drawMesh.use().setMatrixAt(i, transformMatrix)
  }
}

const sceneFramebuffer = new Framebuffer(gl, {
  minFilter: gl.LINEAR,
  magFilter: gl.LINEAR,
  width: innerWidth,
  height: innerHeight,
})

const swapRenderer = new SwapRenderer(gl)
swapRenderer
  .createProgram(PROGRAM_ADVECT, baseVert, advectFrag)
  .createProgram(PROGRAM_INTERACTION_FORCE, cursorVert, addForceFrag2)
  .createProgram(PROGRAM_DIVERGENCE, baseVert, divergenceFrag)
  .createProgram(PROGRAM_JACOBI, baseVert, jacobiFrag)
  .createProgram(PROGRAM_CURL, baseVert, curlShader)
  .createProgram(PROGRAM_VORTICITY, baseVert, vorticityFrag)
  .createProgram(PROGRAM_CLEAR, baseVert, clearFrag)
  .createProgram(
    PROGRAM_SUBTRACT_PRESSURE_GRADIENT,
    baseVert,
    subtractPressureGradientFrag,
  )
  .createProgram(PROGRAM_VISUALISE, baseVert, visFrag)

gl.enable(gl.CULL_FACE)
gl.enable(gl.DEPTH_TEST)
gl.depthFunc(gl.LEQUAL)

checkExtensionsSupport()

document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
resize()
window.addEventListener('resize', throttle(resize, 100))

document.body.addEventListener('mousemove', onMouseMove)
document.body.addEventListener('mouseenter', onMouseEnter)
document.body.addEventListener('touchmove', onTouchMove)

function onMouseEnter(e) {
  const ptX = e.clientX
  const ptY = e.clientY
  targetMouse[0] = (ptX / innerWidth) * 2 - 1
  targetMouse[1] = (ptY / innerHeight) * -2 + 1

  mouse[0] = targetMouse[0]
  mouse[1] = targetMouse[1]

  lastMouse[0] = targetMouse[0]
  lastMouse[1] = targetMouse[1]
}

function onTouchMove(e) {
  e.preventDefault()

  const ptX = e.touches[0].clientX
  const ptY = e.touches[0].clientY

  targetMouse[0] = (ptX / innerWidth) * 2 - 1
  targetMouse[1] = (ptY / innerHeight) * -2 + 1
}

function onMouseMove(e) {
  const ptX = e.clientX
  const ptY = e.clientY

  targetMouse[0] = (ptX / innerWidth) * 2 - 1
  targetMouse[1] = (ptY / innerHeight) * -2 + 1
}

function updateFrame(ts) {
  ts /= 1000

  lastMouse[0] = mouse[0]
  lastMouse[1] = mouse[1]

  mouse[0] += (targetMouse[0] - mouse[0]) * 0.1
  mouse[1] += (targetMouse[1] - mouse[1]) * 0.1

  const dX = mouse[0] - lastMouse[0]
  const dY = mouse[1] - lastMouse[1]

  mouseVelocity[0] = dX
  mouseVelocity[1] = (dY * innerHeight) / innerWidth

  stats.begin()

  gl.disable(gl.DEPTH_TEST)
  updateFluid()

  sceneFramebuffer.bind()
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.enable(gl.DEPTH_TEST)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  drawMesh
    .use()
    .setRotation({ y: ts * 0.2 })
    .setCamera(camera)
    .draw()
  sceneFramebuffer.unbind()

  gl.disable(gl.DEPTH_TEST)
  swapRenderer
    .setSize(innerWidth * dpr, innerHeight * dpr)
    .useProgram(config.programMode)
    .run(PROGRAM_INPUT_TEXTURES.get(config.programMode), null)

  stats.end()

  requestAnimationFrame(updateFrame)
}

function updateFluid() {
  swapRenderer
    .setSize(bgWidth, bgHeight)

    .useProgram(PROGRAM_CURL)
    .run([VELOCITY0], CURL)

    .useProgram(PROGRAM_VORTICITY)
    .setUniform('dt', UNIFORM_TYPE_FLOAT, 1 / 60)
    .setUniform('curl', UNIFORM_TYPE_FLOAT, config.curl)
    .run([VELOCITY0, CURL], VELOCITY1)
    .swap(VELOCITY0, VELOCITY1)

    .useProgram(PROGRAM_INTERACTION_FORCE)
    .setUniform('cursor', UNIFORM_TYPE_VEC2, mouse)
    .setUniform('velocity', UNIFORM_TYPE_VEC2, mouseVelocity)
    .run([VELOCITY0], VELOCITY1)

    .useProgram(PROGRAM_DIVERGENCE)
    .run([VELOCITY1], VELOCITY_DIVERGENCE)

    .useProgram(PROGRAM_CLEAR)
    .setUniform('value', UNIFORM_TYPE_FLOAT, config.pressure)
    .run([PRESSURE0], PRESSURE1)

    .swap(PRESSURE0, PRESSURE1)

  for (let ii = 0; ii < ITERATIONS_COUNT; ii = ii + 1) {
    swapRenderer
      .useProgram(PROGRAM_JACOBI)
      .run([PRESSURE0, VELOCITY_DIVERGENCE], PRESSURE1)
      .swap(PRESSURE0, PRESSURE1)
  }

  swapRenderer
    .useProgram(PROGRAM_SUBTRACT_PRESSURE_GRADIENT)
    .run([PRESSURE0, VELOCITY1], VELOCITY0)
    .useProgram(PROGRAM_ADVECT)
    .run([VELOCITY0, VELOCITY0], VELOCITY1)
    .swap(VELOCITY0, VELOCITY1)
}

function resize() {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()

  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)

  const scale = 0.3
  bgWidth = innerWidth * scale
  bgHeight = innerHeight * scale
  const px_x = 1 / bgWidth
  const px_y = 1 / bgHeight
  px = [px_x, px_y]
  px1 = [1, innerWidth / innerHeight]

  const swapRenderFiltering = hasFloatPointLinearFiltering
    ? gl.LINEAR
    : gl.NEAREST

  sceneFramebuffer.updateWithSize(innerWidth * dpr, innerHeight * dpr, true)

  swapRenderer

    .setSize(bgWidth, bgHeight)

    .useProgram(PROGRAM_ADVECT)
    .setUniform('source', UNIFORM_TYPE_INT, 0)
    .setUniform('velocity', UNIFORM_TYPE_INT, 1)
    .setUniform('dt', UNIFORM_TYPE_FLOAT, 1 / 60)
    .setUniform('scale', UNIFORM_TYPE_FLOAT, config.scale)
    .setUniform('px1', UNIFORM_TYPE_VEC2, px1)
    .setUniform('px', UNIFORM_TYPE_VEC2, px)

    .useProgram(PROGRAM_INTERACTION_FORCE)
    .setUniform('px', UNIFORM_TYPE_VEC2, px)
    .setUniform('cursor', UNIFORM_TYPE_VEC2, mouse)
    .setUniform('uBase', UNIFORM_TYPE_INT, 0)
    .setUniform('velocity', UNIFORM_TYPE_VEC2, mouseVelocity)

    .useProgram(PROGRAM_DIVERGENCE)
    .setUniform('velocity', UNIFORM_TYPE_INT, 0)
    .setUniform('px', UNIFORM_TYPE_VEC2, px)

    .useProgram(PROGRAM_CLEAR)
    .setUniform('pressure', UNIFORM_TYPE_INT, 0)
    .setUniform('value', UNIFORM_TYPE_FLOAT, config.pressure)
    .setUniform('px', UNIFORM_TYPE_VEC2, px)

    .useProgram(PROGRAM_CURL)
    .setUniform('velocity', UNIFORM_TYPE_INT, 0)
    .setUniform('px', UNIFORM_TYPE_VEC2, px)

    .useProgram(PROGRAM_VORTICITY)
    .setUniform('velocity', UNIFORM_TYPE_INT, 0)
    .setUniform('uCurl', UNIFORM_TYPE_INT, 1)
    .setUniform('px', UNIFORM_TYPE_VEC2, px)

    .useProgram(PROGRAM_JACOBI)
    .setUniform('pressure', UNIFORM_TYPE_INT, 0)
    .setUniform('divergence', UNIFORM_TYPE_INT, 1)
    .setUniform('px', UNIFORM_TYPE_VEC2, px)
    .setUniform('alpha', UNIFORM_TYPE_FLOAT, -1)
    .setUniform('beta', UNIFORM_TYPE_FLOAT, 0.25)

    .useProgram(PROGRAM_SUBTRACT_PRESSURE_GRADIENT)
    .setUniform('pressure', UNIFORM_TYPE_INT, 0)
    .setUniform('velocity', UNIFORM_TYPE_INT, 1)
    .setUniform('px', UNIFORM_TYPE_VEC2, px)
    .setUniform('scale', UNIFORM_TYPE_FLOAT, 1)

    .useProgram(PROGRAM_VISUALISE)
    .setUniform('pressure', UNIFORM_TYPE_INT, 0)
    .setUniform('velocity', UNIFORM_TYPE_INT, 1)
    .setUniform('sceneTexture', UNIFORM_TYPE_INT, 2)
    .setUniform('px', UNIFORM_TYPE_VEC2, px)

    .createTexture(VELOCITY0, bgWidth, bgHeight, null, swapRenderFiltering)
    .createFramebuffer(VELOCITY0, bgWidth, bgHeight)

    .createTexture(VELOCITY1, bgWidth, bgHeight, null, swapRenderFiltering)
    .createFramebuffer(VELOCITY1, bgWidth, bgHeight)

    .createTexture(
      VELOCITY_DIVERGENCE,
      bgWidth,
      bgHeight,
      null,
      swapRenderFiltering,
    )
    .createFramebuffer(VELOCITY_DIVERGENCE, bgWidth, bgHeight)

    .createTexture(PRESSURE0, bgWidth, bgHeight, null, swapRenderFiltering)
    .createFramebuffer(PRESSURE0, bgWidth, bgHeight)

    .createTexture(PRESSURE1, bgWidth, bgHeight, null, swapRenderFiltering)
    .createFramebuffer(PRESSURE1, bgWidth, bgHeight)

    .createTexture(CURL, bgWidth, bgHeight, null, swapRenderFiltering)
    .createFramebuffer(CURL, bgWidth, bgHeight)

    .addTexture(SCENE, sceneFramebuffer.texture)
    .addFramebuffer(SCENE, sceneFramebuffer)
}

function checkExtensionsSupport() {
  // check we can use floating point textures
  getExtension(gl, 'OES_texture_float')
  // if (!ext1) {
  //   errorLogWrapper.style.display = 'flex'
  //   errorLogWrapper.innerHTML += `
  //   <p>⚠️ Need OES_texture_float</p>
  // `
  // }
  hasFloatPointLinearFiltering = getExtension(gl, 'OES_texture_float_linear')
  if (!hasFloatPointLinearFiltering) {
    // ...
  }
}
