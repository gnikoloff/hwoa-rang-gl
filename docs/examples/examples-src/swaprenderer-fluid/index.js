import Stats from 'stats-js'
import * as dat from 'dat.gui'
import throttle from 'lodash.throttle'

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

import { vec3, mat4 } from 'gl-matrix'

const advectFrag = `
  uniform sampler2D source;
  uniform sampler2D velocity;
  uniform float dt;
  uniform float scale;
  uniform vec2 px1;
  varying vec2 uv;

  void main(){
    gl_FragColor = texture2D(source, uv-texture2D(velocity, uv).xy * dt * px1) * scale;
  }
`

const divergenceFrag = `

  precision mediump sampler2D;
  uniform sampler2D velocity;
  
  varying highp vec2 uv;
  varying highp vec2 vL;
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;

  void main () {
    float L = texture2D(velocity, vL).x;
    float R = texture2D(velocity, vR).x;
    float T = texture2D(velocity, vT).y;
    float B = texture2D(velocity, vB).y;
    vec2 C = texture2D(velocity, uv).xy;
    
    if (vL.x < 0.0) { L = -C.x; }
    if (vR.x > 1.0) { R = -C.x; }
    if (vT.y > 1.0) { T = -C.y; }
    if (vB.y < 0.0) { B = -C.y; }
    
    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
  }
`

const jacobiFrag = `
  uniform sampler2D pressure;
  uniform sampler2D divergence;
  uniform float alpha;
  uniform float beta;
  uniform vec2 px;
  varying vec2 uv;

  varying highp vec2 vL;
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;

  void main(){
    float x0 = texture2D(pressure, vL).r;
    float x1 = texture2D(pressure, vR).r;
    float y0 = texture2D(pressure, vT).r;
    float y1 = texture2D(pressure, vB).r;
    float d = texture2D(divergence, uv).r;
    
    float relaxed = (x0 + x1 + y0 + y1 + alpha * d) * beta;
    gl_FragColor = vec4(relaxed);
  }
`

const subtractPressureGradientFrag = `
  uniform sampler2D pressure;
  uniform sampler2D velocity;
  uniform float scale;
  uniform vec2 px;
  
  varying vec2 uv;

  void main(){
    float x0 = texture2D(pressure, uv-vec2(px.x, 0)).r;
    float x1 = texture2D(pressure, uv+vec2(px.x, 0)).r;
    float y0 = texture2D(pressure, uv-vec2(0, px.y)).r;
    float y1 = texture2D(pressure, uv+vec2(0, px.y)).r;
    vec2 v = texture2D(velocity, uv).xy;
    vec4 v2 = vec4((v-(vec2(x1, y1)-vec2(x0, y0))*0.5) * scale, 1.0, 1.0);
  
    gl_FragColor = v2;
  }
`

const clearFrag = `
  uniform sampler2D pressure;
  uniform float value;

  varying vec2 uv;
  void main () {
    gl_FragColor = value * texture2D(pressure, uv);
  }
`

const curlShader = `
  uniform sampler2D velocity;

  varying vec2 uv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;

  void main () {
    float L = texture2D(velocity, vL).y;
    float R = texture2D(velocity, vR).y;
    float T = texture2D(velocity, vT).x;
    float B = texture2D(velocity, vB).x;
    float vorticity = R - L - T + B;
    gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
  }
`

const vorticityShader = `
  uniform sampler2D velocity;
  uniform sampler2D uCurl;
  uniform float curl;
  uniform float dt;

  varying vec2 uv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;

  void main () {
    float L = texture2D(uCurl, vL).x;
    float R = texture2D(uCurl, vR).x;
    float T = texture2D(uCurl, vT).x;
    float B = texture2D(uCurl, vB).x;
    float C = texture2D(uCurl, uv).x;
    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
    force /= length(force) + 0.0001;
    force *= curl * C;
    force.y *= -1.0;
    vec2 vel = texture2D(velocity, uv).xy;
    gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
  }
`

const visFrag = `
  uniform sampler2D velocity;
  uniform sampler2D pressure;

  uniform sampler2D sceneTexture;

  uniform float uAlpha;

  uniform vec2 px1;
  varying vec2 uv;
  
  void main(){
    vec2 vel = texture2D(velocity, uv).xy * 0.5 + vec2(0.5);
    float pre = 0.5 - texture2D(pressure, uv).x  * 0.5;

    vec4 color = vec4(vel, pre, 0.0);
    vec4 baseColor = texture2D(sceneTexture, uv + vel * 0.5 - 0.25);

    gl_FragColor = baseColor;
  }
`

const baseVert = `
  attribute vec4 position;

  uniform vec2 px;
  varying vec2 uv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  
  void main(){
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;

    uv = vec2(0.5)+(gl_Position.xy)*0.5;
    vL = uv - vec2(px.x, 0.0);
    vR = uv + vec2(px.x, 0.0);
    vT = uv + vec2(0.0, px.y);
    vB = uv - vec2(0.0, px.y);
  }
`

const cursorVert = `
  uniform vec2 cursor;
  uniform vec2 px;

  attribute vec4 position;
  
  varying vec2 vPosition;
  varying vec2 uv;
  
  void main(){
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
    vPosition = gl_Position.xy;
    uv = vec2(0.5) + (gl_Position.xy) * 0.5;
  }
`

const addForceFrag2 = `
  uniform sampler2D uBase;
  uniform vec2 velocity;
  uniform vec2 cursor;
  uniform vec2 px;

  varying vec2 uv;
  varying vec2 vPosition;
  
  float blendAdd(float base, float blend) {
    return min(base+blend,1.0);
  }
  
  vec3 blendAdd(vec3 base, vec3 blend) {
    return min(base+blend,vec3(1.0));
  }
  
  vec3 blendAdd(vec3 base, vec3 blend, float opacity) {
    return (blendAdd(base, blend) * opacity + base * (1.0 - opacity));
  }
  
  void main(){    
    float dist = distance(cursor/px, vPosition/px);
    vec3 color = texture2D(uBase, uv).rgb;
    float dx = 2.0 * px.x;
    float dy = 2.0 * px.y;
    float marginX = 1.0 - dx;
    float marginY = 1.0 - dy;
    if(dist < 20. && length(dist) > 0. && uv.x < marginX && uv.x > dx && uv.y < marginY && uv.y > dy){
        color = color - vec3(velocity.xy * 10., 0.0) * clamp(2.0 - dist/40., 0.0, 1.0);
    }
    gl_FragColor = vec4(color, 1.0);
  }
`

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
  .createProgram(PROGRAM_VORTICITY, baseVert, vorticityShader)
  .createProgram(PROGRAM_CLEAR, baseVert, clearFrag)
  .createProgram(
    PROGRAM_SUBTRACT_PRESSURE_GRADIENT,
    baseVert,
    subtractPressureGradientFrag,
  )
  .createProgram(PROGRAM_VISUALISE, baseVert, visFrag)

gl.enable(gl.CULL_FACE)
gl.enable(gl.DEPTH_TEST)

checkExtensionsSupport()

document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
resize()
window.addEventListener('resize', throttle(resize, 100))

document.body.addEventListener('mousemove', onMouseMove)
document.body.addEventListener('mouseenter', onMouseEnter)

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

function onMouseMove(e) {
  const ptX = e.clientX
  const ptY = e.clientY

  targetMouse[0] = (ptX / innerWidth) * 2 - 1
  targetMouse[1] = (ptY / innerHeight) * -2 + 1
}

function updateFrame() {
  lastMouse[0] = mouse[0]
  lastMouse[1] = mouse[1]

  mouse[0] += (targetMouse[0] - mouse[0]) * 0.1
  mouse[1] += (targetMouse[1] - mouse[1]) * 0.1

  const dX = mouse[0] - lastMouse[0]
  const dY = mouse[1] - lastMouse[1]

  mouseVelocity[0] = dX
  mouseVelocity[1] = (dY * innerHeight) / innerWidth

  stats.begin()

  updateFluid()

  sceneFramebuffer.bind()
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  drawMesh.use().setCamera(camera).draw()
  sceneFramebuffer.unbind()

  swapRenderer
    .setSize(innerWidth * dpr, innerHeight * dpr)
    .useProgram(config.programMode)
    .run(PROGRAM_INPUT_TEXTURES.get(config.programMode), null)

  stats.end()

  requestAnimationFrame(updateFrame)
}

function updateFluid() {
  gl.disable(gl.DEPTH_TEST)

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
  const ext1 = getExtension(gl, 'OES_texture_float')
  if (!ext1) {
    errorLogWrapper.style.display = 'flex'
    errorLogWrapper.innerHTML += `
    <p>⚠️ Need OES_texture_float</p>
  `
  }
  hasFloatPointLinearFiltering = getExtension(gl, 'OES_texture_float_linear')
  if (!hasFloatPointLinearFiltering) {
    // ...
  }
}
