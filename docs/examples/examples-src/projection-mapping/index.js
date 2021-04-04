import Stats from 'stats-js'
import * as dat from 'dat.gui'
import { vec3, mat4 } from 'gl-matrix'

import {
  PerspectiveCamera,
  CameraController,
  Geometry,
  GeometryUtils,
  Mesh,
  Texture,
} from '../../../../dist/esm'

const UP_VECTOR = [0, 1, 0]

// prettier-ignore
const CUBE_VERTICES = [
  -1, -1, -1,
    1, -1, -1,
  -1,  1, -1,
    1,  1, -1,
  -1, -1,  1,
    1, -1,  1,
  -1,  1,  1,
    1,  1,  1,
]

// prettier-ignore
const CUBE_INDICES = [
  0, 1,
  1, 3,
  3, 2,
  2, 0,

  4, 5,
  5, 7,
  7, 6,
  6, 4,

  0, 4,
  1, 5,
  3, 7,
  2, 6,
]

// prettier-ignore
const CHECKERBOARD_TEXTURE_DATA = [
  0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
  0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
  0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
  0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
  0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
  0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
  0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
  0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
]

const CUBE_VERTEX_SHADER = `
  attribute vec4 position;
  void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
  }
`

const CUBE_FRAGMENT_SHADER = `
  uniform vec4 color;
  void main() {
    gl_FragColor = color;
  }
`

const CHECKERED_VERTEX_SHADER = `
  uniform mat4 textureMatrix;

  attribute vec4 position;
  attribute vec2 uv;

  varying vec4 v_projectedTexcoord;
  varying vec2 v_uv;

  void main () {
    vec4 worldPosition = modelMatrix * position;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;

    v_uv = uv;
    v_projectedTexcoord = textureMatrix * worldPosition;
  }
`

const CHECKERED_FRAGMENT_SHADER = `
  uniform vec4 colorMult;
  uniform sampler2D texture;
  uniform sampler2D projectedTexture;
  
  varying vec4 v_projectedTexcoord;
  varying vec2 v_uv;

  void main () {
    // gl_FragColor = texture2D(texture, v_uv) * colorMult;

    vec3 projectedTexcoord = v_projectedTexcoord.xyz / v_projectedTexcoord.w;
    bool inRange = 
        projectedTexcoord.x >= 0.0 &&
        projectedTexcoord.x <= 1.0 &&
        projectedTexcoord.y >= 0.0 &&
        projectedTexcoord.y <= 1.0;
    
    vec4 projectedTexColor = texture2D(projectedTexture, vec2(projectedTexcoord.x, 1.0 - projectedTexcoord.y));
    vec4 texColor = texture2D(texture, v_uv) * colorMult;
  
    float projectedAmount = inRange ? 1.0 : 0.0;
    gl_FragColor = mix(texColor, projectedTexColor, projectedAmount);
  }
`

const STEP_VAL = 0.05

const OPTIONS = {
  posX: 0.55,
  posY: -1.4,
  posZ: -8.8,
  targetX: -1.4,
  targetY: -20,
  targetZ: 3.5,
  projectionScaleX: 1.3,
  projectionScaleY: 1.3,
  perspective: true,
  fieldOfView: 18.25,
}

const stats = new Stats()
document.body.appendChild(stats.domElement)

const gui = new dat.GUI()

const dpr = devicePixelRatio
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

let oldTime = 0

let sphereMesh
let planeMesh
let cubeMesh
let projectedTexture

const textureWorldMatrix = mat4.create()
const textureProjectionMatrix = mat4.create()
const cubeWorldMatrix = mat4.create()

const projectionPos = vec3.create()
const projectionTarget = vec3.create()

const updateTexMatrix = ({
  posX = OPTIONS.posX,
  posY = OPTIONS.posY,
  posZ = OPTIONS.posZ,
  targetX = OPTIONS.targetX,
  targetY = OPTIONS.targetY,
  targetZ = OPTIONS.targetZ,
  projectionScaleX = OPTIONS.projectionScaleX,
  projectionScaleY = OPTIONS.projectionScaleY,
  perspective = OPTIONS.perspective,
  fieldOfView = OPTIONS.fieldOfView,
} = {}) => {
  vec3.set(projectionPos, posX, posY, posZ)
  vec3.set(projectionTarget, targetX, targetY, targetZ)

  mat4.lookAt(textureWorldMatrix, projectionPos, projectionTarget, UP_VECTOR)

  const near = 0.1
  const far = 200

  if (perspective) {
    mat4.perspective(
      textureProjectionMatrix,
      (fieldOfView * Math.PI) / 180,
      projectionScaleX / projectionScaleY,
      near,
      far,
    )
  } else {
    mat4.ortho(
      textureProjectionMatrix,
      -projectionScaleX / 2,
      projectionScaleX / 2,
      -projectionScaleY / 2,
      projectionScaleY / 2,
      near,
      far,
    )
  }

  const textureWorldMatrixInv = mat4.create()
  mat4.invert(textureWorldMatrixInv, textureWorldMatrix)

  const textureMatrix = mat4.create()
  const transformVec = vec3.create()
  vec3.set(transformVec, 0.5, 0.5, 0.5)
  mat4.translate(textureMatrix, textureMatrix, transformVec)
  mat4.scale(textureMatrix, textureMatrix, transformVec)
  mat4.mul(textureMatrix, textureMatrix, textureProjectionMatrix)
  mat4.mul(textureMatrix, textureMatrix, textureWorldMatrixInv)

  sphereMesh.use().setUniform('textureMatrix', 'mat4', textureMatrix)
  planeMesh.use().setUniform('textureMatrix', 'mat4', textureMatrix)

  const textureProjectionMatrixInv = mat4.create()
  mat4.invert(textureProjectionMatrixInv, textureProjectionMatrix)

  mat4.mul(cubeWorldMatrix, textureWorldMatrix, textureProjectionMatrixInv)

  cubeMesh
    .use()
    .setCamera(camera)
    .setUniform('modelMatrix', 'mat4', cubeWorldMatrix)
}

gui
  .add(OPTIONS, 'posX')
  .min(-20)
  .max(20)
  .step(STEP_VAL)
  .onChange(updateTexMatrix)
gui
  .add(OPTIONS, 'posY')
  .min(-20)
  .max(20)
  .step(STEP_VAL)
  .onChange(updateTexMatrix)
gui
  .add(OPTIONS, 'posZ')
  .min(-20)
  .max(20)
  .step(STEP_VAL)
  .onChange(updateTexMatrix)
gui
  .add(OPTIONS, 'targetX')
  .min(-20)
  .max(20)
  .step(STEP_VAL)
  .onChange(updateTexMatrix)
gui
  .add(OPTIONS, 'targetY')
  .min(-20)
  .max(20)
  .step(STEP_VAL)
  .onChange(updateTexMatrix)
gui
  .add(OPTIONS, 'targetZ')
  .min(-20)
  .max(20)
  .step(STEP_VAL)
  .onChange(updateTexMatrix)
gui
  .add(OPTIONS, 'projectionScaleX')
  .min(0.1)
  .max(5)
  .step(0.1)
  .onChange(updateTexMatrix)
gui
  .add(OPTIONS, 'projectionScaleY')
  .min(0.1)
  .max(5)
  .step(0.1)
  .onChange(updateTexMatrix)
gui.add(OPTIONS, 'perspective').onChange(updateTexMatrix)
gui
  .add(OPTIONS, 'fieldOfView')
  .min(1)
  .max(180)
  .step(STEP_VAL)
  .onChange(updateTexMatrix)

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
camera.position = [-7.9, 7.26, -13.1]
camera.lookAt([0, 0, 0])

new CameraController(camera, canvas)

const checkeredTexture = new Texture(gl, {
  format: gl.LUMINANCE,
  magFilter: gl.NEAREST,
  minFilter: gl.NEAREST,
})
checkeredTexture
  .bind()
  .fromData(new Uint8Array(CHECKERBOARD_TEXTURE_DATA), 8, 8)

const sharedUniforms = {
  texture: { type: 'int', value: 0 },
  projectedTexture: { type: 'int', value: 1 },
  textureMatrix: { type: 'mat4', value: textureWorldMatrix },
}

/* ---- Sphere mesh ---- */
{
  const { indices, vertices, uv } = GeometryUtils.createSphere({
    radius: 2,
    widthSegments: 12,
    heightSegments: 5,
  })
  const geometry = new Geometry(gl)
  geometry
    .addIndex({
      typedArray: indices,
    })
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
      ...sharedUniforms,
      colorMult: { type: 'vec4', value: [1, 0, 0, 1] },
    },
    vertexShaderSource: CHECKERED_VERTEX_SHADER,
    fragmentShaderSource: CHECKERED_FRAGMENT_SHADER,
  })
  sphereMesh.setPosition({ y: 3 })
}

/* ---- Plane mesh ---- */
{
  const { indices, vertices, uv } = GeometryUtils.createPlane({
    width: 40,
    height: 40,
  })
  const geometry = new Geometry(gl)
  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', { typedArray: vertices, size: 3 })
    .addAttribute('uv', { typedArray: uv, size: 2 })
  planeMesh = new Mesh(gl, {
    geometry,
    uniforms: {
      ...sharedUniforms,
      colorMult: { type: 'vec4', value: [0, 0, 1, 1] },
    },
    vertexShaderSource: CHECKERED_VERTEX_SHADER,
    fragmentShaderSource: CHECKERED_FRAGMENT_SHADER,
  })
  planeMesh.setRotation({ x: 1 }, Math.PI / 2).setPosition({ y: -1.5 })
}

/* ---- Cube Mesh ---- */
{
  const vertices = new Float32Array(CUBE_VERTICES)
  const indices = new Int16Array(CUBE_INDICES)
  const geometry = new Geometry(gl)
  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', { typedArray: vertices, size: 3 })
  cubeMesh = new Mesh(gl, {
    geometry,
    uniforms: {
      color: { type: 'vec4', value: [0, 0, 0, 0.8] },
    },
    vertexShaderSource: CUBE_VERTEX_SHADER,
    fragmentShaderSource: CUBE_FRAGMENT_SHADER,
  })
  cubeMesh.drawMode = gl.LINES
}

{
  const w = 512
  const h = 512
  const texCanvas = document.createElement('canvas')
  const ctx = texCanvas.getContext('2d')
  texCanvas.width = w
  texCanvas.height = h

  ctx.fillStyle = '#e67e22'
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = 'red'
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 1

  ctx.font = '170px Helvetica'
  const lineHeight = 140
  const startX = 20
  const startY = 160

  ctx.fillText('hwoa-', startX, startY)
  // ctx.strokeText('hwoa', startX, startY)

  ctx.fillText('rang-', startX, startY + lineHeight)
  // ctx.strokeText('rang', startX, startY + lineHeight)

  ctx.fillText('gl', startX, startY + lineHeight * 2)
  // ctx.strokeText('gl', startX, startY + lineHeight * 2)

  projectedTexture = new Texture(gl, {
    minFilter: gl.LINEAR_MIPMAP_LINEAR,
  })
    .bind()
    .fromImage(texCanvas)
    .setIsFlip()
    .generateMipmap()
}

updateTexMatrix()
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

  gl.activeTexture(gl.TEXTURE0)
  checkeredTexture.bind()

  if (projectedTexture) {
    gl.activeTexture(gl.TEXTURE0 + 1)
    projectedTexture.bind()
  }

  sphereMesh.use().setCamera(camera).draw()
  planeMesh.use().setCamera(camera).draw()

  cubeMesh.use().setCamera(camera).draw()

  stats.end()

  requestAnimationFrame(updateFrame)
}

function resize() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}
