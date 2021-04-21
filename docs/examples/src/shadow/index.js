import Stats from 'stats-js'
import * as dat from 'dat.gui'
import { vec3, mat4 } from 'gl-matrix'
import throttle from 'lodash.throttle'

import {
  PerspectiveCamera,
  CameraController,
  Geometry,
  GeometryUtils,
  Mesh,
  InstancedMesh,
  UNIFORM_TYPE_INT,
  UNIFORM_TYPE_MATRIX4X4,
  UNIFORM_TYPE_VEC4,
  Framebuffer,
  OrthographicCamera,
  getExtension,
  UNIFORM_TYPE_FLOAT,
  UNIFORM_TYPE_VEC3,
} from '../../../../dist/esm'

import BASE_VERTEX_SHADER from './base.vert'
import BASE_FRAGMENT_SHADER from './base.frag'
import DEBUG_DEPTH_FRAGMENT_SHADER from './debug-depth.frag'
import SHADED_VERTEX_SHADER from './shaded.vert'
import SHADED_FRAGMENT_SHADER from './shaded.frag'
// debugger

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

const STEP_VAL = 0.05
const MESHES_COUNT = 20

const OPTIONS = {
  isDebug: false,
  posX: 0.1,
  posY: 9,
  posZ: 0,
  targetX: 0,
  targetY: 0,
  targetZ: 0,
  projectionScaleX: 1.3,
  projectionScaleY: 1.3,
  fieldOfView: 120,
  shadowBias: -0.006,
}

const stats = new Stats()
document.body.appendChild(stats.domElement)

const gui = new dat.GUI()
gui.close()

const dpr = Math.min(devicePixelRatio, 2)
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

const renderMeshes = []
const colorMeshes = []

getExtension(gl, 'GMAN_debug_helper')

let cubeMesh
// let projectedTexture
let depthFramebuffer
let depthDebugMesh

const lightWorldMatrix = mat4.create()
const lightProjectionMatrix = mat4.create()
const cubeWorldMatrix = mat4.create()
const emptyMatrix = mat4.create()
const textureMatrix = mat4.create()

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
  fieldOfView = OPTIONS.fieldOfView,
  shadowBias = OPTIONS.shadowBias,
} = {}) => {
  vec3.set(projectionPos, posX, posY, posZ)
  vec3.set(projectionTarget, targetX, targetY, targetZ)

  mat4.identity(textureMatrix)

  mat4.lookAt(
    lightWorldMatrix,
    projectionPos,
    projectionTarget,
    PerspectiveCamera.UP_VECTOR,
  )
  mat4.invert(lightWorldMatrix, lightWorldMatrix)

  const near = 0.1
  const far = 200

  mat4.perspective(
    lightProjectionMatrix,
    (fieldOfView * Math.PI) / 180,
    projectionScaleX / projectionScaleY,
    near,
    far,
  )

  const textureWorldMatrixInv = mat4.create()
  mat4.invert(textureWorldMatrixInv, lightWorldMatrix)

  const transformVec = vec3.create()
  vec3.set(transformVec, 0.5, 0.5, 0.5)
  mat4.translate(textureMatrix, textureMatrix, transformVec)
  mat4.scale(textureMatrix, textureMatrix, transformVec)
  mat4.mul(textureMatrix, textureMatrix, lightProjectionMatrix)
  mat4.mul(textureMatrix, textureMatrix, textureWorldMatrixInv)

  renderMeshes.forEach((mesh) =>
    mesh
      .use()
      .setUniform('shadowBias', UNIFORM_TYPE_FLOAT, shadowBias)
      .setUniform('textureMatrix', UNIFORM_TYPE_MATRIX4X4, textureMatrix),
  )

  const lightProjectionMatrixInv = mat4.create()
  mat4.invert(lightProjectionMatrixInv, lightProjectionMatrix)

  mat4.mul(cubeWorldMatrix, lightWorldMatrix, lightProjectionMatrixInv)

  cubeMesh
    .use()
    .setCamera(camera)
    .setUniform('modelMatrix', UNIFORM_TYPE_MATRIX4X4, cubeWorldMatrix)
}

gui.add(OPTIONS, 'isDebug')
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
  .add(OPTIONS, 'fieldOfView')
  .min(1)
  .max(180)
  .step(STEP_VAL)
  .onChange(updateTexMatrix)
gui
  .add(OPTIONS, 'shadowBias')
  .min(-0.01)
  .max(-0.01)
  .step(0.001)
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
camera.position = [-15.25, 13.25, -19.25]
camera.lookAt([0, 0, 0])

const orthoCamera = new OrthographicCamera(
  -innerWidth / 2,
  innerWidth / 2,
  innerHeight / 2,
  -innerHeight / 2,
  0.1,
  4,
)
orthoCamera.position = [0, 0, 2]
orthoCamera.lookAt([0, 0, 0])

new CameraController(camera, canvas)

const sharedUniforms = {
  projectedTexture: { type: UNIFORM_TYPE_INT, value: 0 },
  textureMatrix: { type: UNIFORM_TYPE_MATRIX4X4, value: lightWorldMatrix },
  shadowBias: { type: UNIFORM_TYPE_FLOAT, value: OPTIONS.shadowBias },
  eyePosition: { type: UNIFORM_TYPE_VEC3, value: camera.position },
  'SpotLight.worldPosition': {
    type: UNIFORM_TYPE_VEC3,
    value: [OPTIONS.posX, OPTIONS.posY, OPTIONS.posZ],
  },
  'SpotLight.shininess': { type: UNIFORM_TYPE_FLOAT, value: 40 },
  'SpotLight.lightColor': {
    type: UNIFORM_TYPE_VEC3,
    value: [1, 1, 1],
  },
  'SpotLight.specularColor': {
    type: UNIFORM_TYPE_VEC3,
    value: [0.4, 0.4, 0.4],
  },
  'SpotLight.lightDirection': {
    type: UNIFORM_TYPE_VEC3,
    value: [OPTIONS.targetX, OPTIONS.targetY, OPTIONS.targetZ],
  },
  'SpotLight.innerLimit': {
    type: UNIFORM_TYPE_FLOAT,
    value: ((OPTIONS.fieldOfView / 2 - 10) * Math.PI) / 180,
  },
  'SpotLight.outerLimit': {
    type: UNIFORM_TYPE_FLOAT,
    value: ((OPTIONS.fieldOfView / 2) * Math.PI) / 180,
  },
}

// Math.cos(degToRad())
// Math.cos(degToRad(settings.fieldOfView / 2))

/* ---- Depth Framebuffer ---- */
{
  depthFramebuffer = new Framebuffer(gl, {
    width: innerWidth,
    height: innerHeight,
    useDepthRenderBuffer: false,
  })
}

/* ---- Sphere mesh ---- */
{
  const { indices, vertices, uv, normal } = GeometryUtils.createSphere({
    radius: 1,
    widthSegments: 20,
    heightSegments: 20,
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
    .addAttribute('normal', {
      typedArray: normal,
      size: 3,
    })

  const renderMesh = new InstancedMesh(gl, {
    geometry,
    uniforms: sharedUniforms,
    instanceCount: MESHES_COUNT,
    defines: {
      IS_INSTANCED: 1,
    },
    vertexShaderSource: SHADED_VERTEX_SHADER,
    fragmentShaderSource: SHADED_FRAGMENT_SHADER,
  })

  renderMeshes.push(renderMesh)

  const colorMesh = new InstancedMesh(gl, {
    geometry,
    uniforms: {
      color: { type: UNIFORM_TYPE_VEC4, value: [1, 0.5, 0.5, 1] },
    },
    defines: {
      IS_INSTANCED: 1,
    },
    instanceCount: MESHES_COUNT,
    vertexShaderSource: BASE_VERTEX_SHADER,
    fragmentShaderSource: BASE_FRAGMENT_SHADER,
  })

  colorMeshes.push(colorMesh)

  const matrix = mat4.create()
  const transform = vec3.fromValues(0, 0, 0)

  for (let i = 0; i < MESHES_COUNT; i++) {
    const randX = (Math.random() * 2 - 1) * 6
    const randY = Math.random() * 4
    const randZ = (Math.random() * 2 - 1) * 6

    const randScale = Math.random()

    mat4.identity(matrix)

    vec3.set(transform, randX, randY, randZ)
    mat4.translate(matrix, matrix, transform)
    vec3.set(transform, randScale, randScale, randScale)
    mat4.scale(matrix, matrix, transform)

    renderMesh.setMatrixAt(i, matrix)
    colorMesh.setMatrixAt(i, matrix)
  }
}

/* ---- Plane mesh ---- */
{
  const { indices, vertices, uv, normal } = GeometryUtils.createPlane({
    width: 40,
    height: 40,
  })
  const geometry = new Geometry(gl)
  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', { typedArray: vertices, size: 3 })
    .addAttribute('uv', { typedArray: uv, size: 2 })
    .addAttribute('normal', { typedArray: normal, size: 3 })

  let mesh = new Mesh(gl, {
    geometry,
    uniforms: sharedUniforms,
    // defines: {
    //   USE_VARYINGS: 1,
    //   USE_PROJECTED_TEXCOORD: 1,
    // },
    vertexShaderSource: SHADED_VERTEX_SHADER,
    fragmentShaderSource: SHADED_FRAGMENT_SHADER,
  })
  mesh.setRotation({ x: -Math.PI / 2 }).setPosition({ y: -1.5 })
  renderMeshes.push(mesh)

  mesh = new Mesh(gl, {
    geometry,
    uniforms: {
      color: { type: UNIFORM_TYPE_VEC4, value: [1, 0.5, 0.5, 1] },
    },
    defines: {},
    vertexShaderSource: BASE_VERTEX_SHADER,
    fragmentShaderSource: BASE_FRAGMENT_SHADER,
  })
  mesh.setRotation({ x: -Math.PI / 2 }).setPosition({ y: -1.5 })
  colorMeshes.push(mesh)
}

{
  const width = innerWidth * 0.2
  const height = innerHeight * 0.2
  const { indices, vertices, uv } = GeometryUtils.createPlane({
    width,
    height,
  })
  const geometry = new Geometry(gl)
    .addIndex({ typedArray: indices })
    .addAttribute('position', { typedArray: vertices, size: 3 })
    .addAttribute('uv', { typedArray: uv, size: 2 })
  depthDebugMesh = new Mesh(gl, {
    geometry,
    uniforms: {
      depthTex: { type: UNIFORM_TYPE_INT, value: 0 },
    },
    defines: {
      USE_VARYINGS: 1,
    },
    vertexShaderSource: BASE_VERTEX_SHADER,
    fragmentShaderSource: DEBUG_DEPTH_FRAGMENT_SHADER,
  })
  depthDebugMesh.setPosition({
    x: -innerWidth / 2 + width / 2 + 20,
    y: -innerHeight / 2 + height / 2 + 20,
  })
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
      color: { type: UNIFORM_TYPE_VEC4, value: [0, 0, 0, 0.8] },
    },
    vertexShaderSource: BASE_VERTEX_SHADER,
    fragmentShaderSource: BASE_FRAGMENT_SHADER,
  })
  cubeMesh.drawMode = gl.LINES
  cubeMesh.name = 'cube'
  renderMeshes.push(cubeMesh)
}

updateTexMatrix()
document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
sizeCanvas()
window.addEventListener('resize', throttle(resize, 100))

const viewMatrix = mat4.create()

function updateFrame(ts) {
  ts /= 1000

  stats.begin()

  gl.clearColor(0.1, 0.1, 0.1, 1)

  depthFramebuffer.bind()
  gl.viewport(0, 0, innerWidth, innerHeight)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  mat4.identity(viewMatrix)
  mat4.invert(viewMatrix, lightWorldMatrix)

  colorMeshes.forEach((mesh) => {
    mesh
      .use()
      .setUniform(
        'projectionMatrix',
        UNIFORM_TYPE_MATRIX4X4,
        lightProjectionMatrix,
      )
      .setUniform('viewMatrix', UNIFORM_TYPE_MATRIX4X4, viewMatrix)
      .setUniform('textureMatrix', UNIFORM_TYPE_MATRIX4X4, emptyMatrix)
      .draw()
  })

  depthFramebuffer.unbind()

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  gl.activeTexture(gl.TEXTURE0)
  depthFramebuffer.depthTexture.bind()

  const meshesToRender = OPTIONS.isDebug
    ? renderMeshes
    : renderMeshes.filter((mesh) => mesh.name !== 'cube')

  meshesToRender.forEach((mesh) => {
    mesh
      .use()
      .setUniform(
        'projectionMatrix',
        UNIFORM_TYPE_MATRIX4X4,
        camera.projectionMatrix,
      )
      .setUniform('viewMatrix', UNIFORM_TYPE_MATRIX4X4, camera.viewMatrix)
      .setUniform('textureMatrix', UNIFORM_TYPE_MATRIX4X4, textureMatrix)
      .setUniform('eyePosition', UNIFORM_TYPE_VEC3, camera.position)
      .setUniform('SpotLight.worldPosition', UNIFORM_TYPE_VEC3, [
        OPTIONS.posX,
        OPTIONS.posY,
        OPTIONS.posZ,
      ])
      // .setUniform('SpotLight.lightDirection', UNIFORM_TYPE_VEC3, [
      //   OPTIONS.targetX,
      //   OPTIONS.targetY,
      //   OPTIONS.targetZ,
      // ])
      .draw()
  })

  if (OPTIONS.isDebug) {
    gl.activeTexture(gl.TEXTURE0)
    depthFramebuffer.depthTexture.bind()
    depthDebugMesh.use().setCamera(orthoCamera).draw()
  }

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
