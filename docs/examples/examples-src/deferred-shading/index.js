import { mat4, vec3 } from 'gl-matrix'
import Stats from 'stats-js'
import * as dat from 'dat.gui'
import throttle from 'lodash.throttle'

import {
  getExtension,
  PerspectiveCamera,
  OrthographicCamera,
  CameraController,
  Geometry,
  GeometryUtils,
  Mesh,
  Texture,
  InstancedMesh,
  Framebuffer,
  UNIFORM_TYPE_INT,
  UNIFORM_TYPE_VEC2,
  UNIFORM_TYPE_VEC3,
} from '../../../../dist/esm'

import VERTEX_SHADER_BASE from './base.vert'
import FRAGMENT_SHADER_BASE from './base.frag'

import VERTEX_SHADER_GBUFFER from './gbuffer.vert'
import FRAGMENT_SHADER_GBUFFER from './gbuffer.frag'

import FRAGMENT_SHADER_POINT_LIGHTING from './point-lighting.frag'
import FRAGMENT_SHADER_DIRECTIONAL_LIGHTING from './directional-lighting.frag'

const LIGHTS_COUNT = 100
const LIGHTS_SCALE = 8
const BOXES_RADIUS_X = 30
const BOXES_RADIUS_Z = 30
const BOXES_ROW_X_COUNT = 20
const BOXES_ROW_Z_COUNT = 20
const TOTAL_BOXES_COUNT = BOXES_ROW_X_COUNT * BOXES_ROW_Z_COUNT
const DEBUG_QUAD_WIDTH = innerWidth * 0.125
const DEBUG_QUAD_HEIGHT = innerHeight * 0.125

const CONFIG = {
  lightsCount: 12,
  directionalLight: true,
  fxaa: true,
  debug: false,
}

const gui = new dat.GUI()
const stats = new Stats()
document.body.appendChild(stats.domElement)

const errorLogWrapper = document.getElementById('error-log')
const dpr = Math.min(devicePixelRatio, 2)
const canvas = document.createElement('canvas')
const canvasOpts = { antialias: false }
const gl =
  canvas.getContext('webgl', canvasOpts) ||
  canvas.getContext('experimental-webgl', canvasOpts)
const lightSpheres = []

let activeLightSpheres
let drawMesh
let fullscreenQuadMesh
let fxaaMesh
let debugPositionsMesh
let debugNormalsMesh
let debugUvsMesh

gl.clearColor(0.0, 0.0, 0.0, 1.0)
gl.depthFunc(gl.LEQUAL)

// ------------- Cameras -------------

const perspCamera = new PerspectiveCamera(
  (45 * Math.PI) / 180,
  innerWidth / innerHeight,
  0.1,
  100,
)
perspCamera.position = [10, 4, 10]
perspCamera.lookAt([0, 0, 0])

const orthoCamera = new OrthographicCamera(
  -innerWidth / 2,
  innerWidth / 2,
  innerHeight / 2,
  -innerHeight / 2,
  0.1,
  2,
)
orthoCamera.position = [0, 0, 1]
orthoCamera.lookAt([0, 0, 0])

new CameraController(perspCamera, canvas)

// ------------- Set up GBuffer -------------

const ext = getExtension(gl, 'WEBGL_draw_buffers')
if (!ext) {
  errorLogWrapper.style.display = 'flex'
  errorLogWrapper.innerHTML += `
      <p>⚠️ Need WEBGL_draw_buffers</p>
    `
}

const ext2 = getExtension(gl, 'OES_texture_float')
if (!ext2) {
  errorLogWrapper.style.display = 'flex'
  errorLogWrapper.innerHTML += `
    <p>⚠️ Need OES_texture_float</p>
  `
}

const ext3 = getExtension(gl, 'WEBGL_depth_texture')
if (!ext3) {
  errorLogWrapper.style.display = 'flex'
  errorLogWrapper.innerHTML += `
    <p>⚠️ Need WEBGL_depth_texture</p>
  `
}

const gBuffer = gl.createFramebuffer()
gl.bindFramebuffer(gl.FRAMEBUFFER, gBuffer)

const texturePosition = new Texture(gl, {
  type: gl.FLOAT,
  format: gl.RGB,
  minFilter: gl.NEAREST,
  magFilter: gl.NEAREST,
})
  .bind()
  .fromSize(innerWidth, innerHeight)

gl.framebufferTexture2D(
  gl.FRAMEBUFFER,
  ext.COLOR_ATTACHMENT0_WEBGL,
  gl.TEXTURE_2D,
  texturePosition.getTexture(),
  0,
)

const textureNormal = new Texture(gl, {
  type: gl.FLOAT,
  format: gl.RGB,
  minFilter: gl.NEAREST,
  magFilter: gl.NEAREST,
})
  .bind()
  .fromSize(innerWidth, innerHeight)

gl.framebufferTexture2D(
  gl.FRAMEBUFFER,
  ext.COLOR_ATTACHMENT1_WEBGL,
  gl.TEXTURE_2D,
  textureNormal.getTexture(),
  0,
)
const textureColor = new Texture(gl, {
  type: gl.FLOAT,
  format: gl.RGB,
  minFilter: gl.NEAREST,
  magFilter: gl.NEAREST,
})
  .bind()
  .fromSize(innerWidth, innerHeight)

gl.framebufferTexture2D(
  gl.FRAMEBUFFER,
  ext.COLOR_ATTACHMENT2_WEBGL,
  gl.TEXTURE_2D,
  textureColor.getTexture(),
  0,
)

const depthTexture = new Texture(gl, {
  minFilter: gl.LINEAR,
  magFilter: gl.LINEAR,
  type: gl.UNSIGNED_SHORT,
  format: gl.DEPTH_COMPONENT,
})
  .bind()
  .setIsFlip(false)
  .fromSize(innerWidth, innerHeight)

gl.framebufferTexture2D(
  gl.FRAMEBUFFER,
  gl.DEPTH_ATTACHMENT,
  gl.TEXTURE_2D,
  depthTexture.getTexture(),
  0,
)

if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
  console.log('cant use gBuffer!')
}

ext.drawBuffersWEBGL([
  ext.COLOR_ATTACHMENT0_WEBGL, // gl_FragData[0]
  ext.COLOR_ATTACHMENT1_WEBGL, // gl_FragData[1]
  ext.COLOR_ATTACHMENT2_WEBGL, // gl_FragData[2]
])
gl.bindFramebuffer(gl.FRAMEBUFFER, null)

const textureImage = new Texture(gl, { minFilter: gl.LINEAR_MIPMAP_LINEAR })
  .bind()
  .fromSize(512, 512)
  .generateMipmap()

// ------------- FXAA -------------
const fxaaFramebuffer = new Framebuffer(gl, {
  format: gl.RGBA,
  type: gl.FLOAT,
  width: innerWidth,
  height: innerHeight,
})
{
  const { indices, vertices, uv } = GeometryUtils.createPlane({
    width: innerWidth,
    height: innerHeight,
  })
  const geometry = new Geometry(gl)
  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', { typedArray: vertices, size: 3 })
    .addAttribute('uv', { typedArray: uv, size: 2 })
  fxaaMesh = new Mesh(gl, {
    geometry,
    defines: {
      INCLUDE_UVS: 1,
      USE_FXAA: 1,
    },
    uniforms: {
      texture: { type: UNIFORM_TYPE_INT, value: 0 },
      resolution: { type: UNIFORM_TYPE_VEC2, value: [innerWidth, innerHeight] },
    },
    vertexShaderSource: VERTEX_SHADER_BASE,
    fragmentShaderSource: FRAGMENT_SHADER_BASE,
  })
}

// ------------- Cube Meshes -------------
const img = new Image()
img.onload = () => {
  textureImage.bind().fromImage(img).generateMipmap()
}
img.src = window.location.href.includes('github')
  ? '/hwoa-rang-gl/examples/dist/assets/textures/box.jpeg'
  : '/examples/dist/assets/textures/box.jpeg'

{
  const { indices, vertices, uv, normal } = GeometryUtils.createBox()
  const geometry = new Geometry(gl)
  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', { typedArray: vertices, size: 3 })
    .addAttribute('uv', { typedArray: uv, size: 2 })
    .addAttribute('normal', { typedArray: normal, size: 3 })

  drawMesh = new InstancedMesh(gl, {
    geometry,
    instanceCount: TOTAL_BOXES_COUNT,
    uniforms: {},
    vertexShaderSource: VERTEX_SHADER_GBUFFER,
    fragmentShaderSource: FRAGMENT_SHADER_GBUFFER,
  })

  let i = 0
  const stepx = BOXES_RADIUS_X / BOXES_ROW_X_COUNT
  const stepy = BOXES_RADIUS_Z / BOXES_ROW_Z_COUNT
  for (let x = 0; x < BOXES_ROW_X_COUNT; x++) {
    for (let y = 0; y < BOXES_ROW_Z_COUNT; y++) {
      const posX = x * stepx - (BOXES_ROW_X_COUNT * stepx) / 2
      const posZ = y * stepy - (BOXES_ROW_Z_COUNT * stepy) / 2
      const scaleY = 1 + Math.random() * 3
      const translateVec = vec3.fromValues(posX, scaleY / 2, posZ)
      const matrix = mat4.create()
      mat4.translate(matrix, matrix, translateVec)
      mat4.scale(matrix, matrix, vec3.fromValues(1, scaleY, 1))
      drawMesh.setMatrixAt(i, matrix)
      i++
    }
  }
}

// ------------- Sphere Light Meshes -------------
{
  const { indices, vertices } = GeometryUtils.createSphere({
    widthSegments: 30,
    heightSegments: 8,
  })
  const geometry = new Geometry(gl)

  geometry.addIndex({ typedArray: indices }).addAttribute('position', {
    typedArray: vertices,
    size: 3,
  })

  const sharedLightsUniforms = {
    positionTexture: { type: UNIFORM_TYPE_INT, value: 0 },
    normalTexture: { type: UNIFORM_TYPE_INT, value: 1 },
    colorTexture: { type: UNIFORM_TYPE_INT, value: 2 },
    texture: { type: UNIFORM_TYPE_INT, value: 3 },
    eyePosition: { type: UNIFORM_TYPE_VEC3, value: perspCamera.position },
    resolution: {
      type: UNIFORM_TYPE_VEC2,
      value: [innerWidth, innerHeight],
    },
  }

  for (let i = 0; i < LIGHTS_COUNT; i++) {
    const randX = (Math.random() * 2 - 1) * 10
    const randY = 1 + Math.random() * 2
    const randZ = (Math.random() * 2 - 1) * 10

    const randShininess = Math.random() * 20
    const randSpecular = Math.random() * 2

    const randR = Math.random()
    const randG = Math.random()
    const randB = Math.random()

    const randScale = LIGHTS_SCALE * 0.4 + Math.random() * (LIGHTS_SCALE * 0.6)

    const mesh = new Mesh(gl, {
      geometry,
      uniforms: {
        ...sharedLightsUniforms,
        'PointLight.shininessSpecularRadius': {
          type: UNIFORM_TYPE_VEC3,
          value: [randShininess, randSpecular, randScale],
        },
        'PointLight.position': {
          type: UNIFORM_TYPE_VEC3,
          value: [randX, randY, randZ],
        },
        'PointLight.color': {
          type: UNIFORM_TYPE_VEC3,
          value: [randR, randG, randB],
        },
      },
      vertexShaderSource: VERTEX_SHADER_BASE,
      fragmentShaderSource: FRAGMENT_SHADER_POINT_LIGHTING,
    })
    mesh
      .setPosition({ x: randX, y: randY, z: randZ })
      .setScale({ x: randScale, y: randScale, z: randScale })
    lightSpheres.push(mesh)
  }
  activeLightSpheres = lightSpheres.filter((_, i) => i < CONFIG.lightsCount)
}

// ------------- Directional fullscreen quad -------------
{
  const { indices, vertices } = GeometryUtils.createPlane({
    width: innerWidth,
    height: innerHeight,
  })
  const geometry = new Geometry(gl)
  geometry.addIndex({ typedArray: indices }).addAttribute('position', {
    typedArray: vertices,
    size: 3,
  })
  fullscreenQuadMesh = new Mesh(gl, {
    geometry,
    uniforms: {
      positionTexture: { type: UNIFORM_TYPE_INT, value: 0 },
      normalTexture: { type: UNIFORM_TYPE_INT, value: 1 },
      colorTexture: { type: UNIFORM_TYPE_INT, value: 2 },
      texture: { type: UNIFORM_TYPE_INT, value: 3 },
      resolution: { type: UNIFORM_TYPE_VEC2, value: [innerWidth, innerHeight] },
      lightDirection: { type: UNIFORM_TYPE_VEC3, value: [1, 2, 2] },
    },
    vertexShaderSource: VERTEX_SHADER_BASE,
    fragmentShaderSource: FRAGMENT_SHADER_DIRECTIONAL_LIGHTING,
  })
}

// ------------- Debug Positions quad -------------
{
  const { indices, vertices, uv } = GeometryUtils.createPlane({
    width: DEBUG_QUAD_WIDTH,
    height: DEBUG_QUAD_HEIGHT,
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
  debugPositionsMesh = new Mesh(gl, {
    geometry,
    defines: {
      INCLUDE_UVS: 1,
    },
    vertexShaderSource: VERTEX_SHADER_BASE,
    fragmentShaderSource: FRAGMENT_SHADER_BASE,
  })
  debugNormalsMesh = new Mesh(gl, {
    geometry,
    defines: {
      INCLUDE_UVS: 1,
    },
    vertexShaderSource: VERTEX_SHADER_BASE,
    fragmentShaderSource: FRAGMENT_SHADER_BASE,
  })
  let accX = -innerWidth / 2 + DEBUG_QUAD_WIDTH / 2 + 20
  debugPositionsMesh.setPosition({
    x: accX,
    y: -innerHeight / 2 + DEBUG_QUAD_HEIGHT / 2 + 20,
  })
  accX += DEBUG_QUAD_WIDTH + 10
  debugNormalsMesh.setPosition({
    x: accX,
    y: -innerHeight / 2 + DEBUG_QUAD_HEIGHT / 2 + 20,
  })
  debugUvsMesh = new Mesh(gl, {
    geometry,
    defines: {
      INCLUDE_UVS: 1,
    },
    vertexShaderSource: VERTEX_SHADER_BASE,
    fragmentShaderSource: FRAGMENT_SHADER_BASE,
  })
  accX += DEBUG_QUAD_WIDTH + 10
  debugUvsMesh.setPosition({
    x: accX,
    y: -innerHeight / 2 + DEBUG_QUAD_HEIGHT / 2 + 20,
  })
}

gui
  .add(CONFIG, 'lightsCount')
  .min(1)
  .max(LIGHTS_COUNT)
  .step(1)
  .onChange((val) => {
    activeLightSpheres = lightSpheres.filter((_, i) => i < val)
  })
gui.add(CONFIG, 'directionalLight')
gui.add(CONFIG, 'fxaa')
gui.add(CONFIG, 'debug')

document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
sizeCanvas()
window.addEventListener('resize', throttle(resize, 100))

function updateFrame(ts) {
  ts /= 1000

  stats.begin()

  // ------------- Render cubes into GBuffer -------------

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.blendFunc(gl.ONE, gl.ONE)

  gl.bindFramebuffer(gl.FRAMEBUFFER, gBuffer)

  gl.depthMask(true)
  gl.enable(gl.DEPTH_TEST)
  gl.disable(gl.BLEND)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  drawMesh
    .use()
    .setRotation({ y: 1 }, ts * 0.1)
    .setCamera(perspCamera)
    .draw()

  if (CONFIG.fxaa) {
    fxaaFramebuffer.bind()
  } else {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  // ------------- Deferred point lighting -------------

  gl.depthMask(false)
  gl.disable(gl.DEPTH_TEST)
  gl.enable(gl.BLEND)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  gl.activeTexture(gl.TEXTURE0)
  texturePosition.bind()
  gl.activeTexture(gl.TEXTURE1)
  textureNormal.bind()
  gl.activeTexture(gl.TEXTURE2)
  textureColor.bind()
  gl.activeTexture(gl.TEXTURE3)
  textureImage.bind()

  activeLightSpheres.forEach((mesh) =>
    mesh
      .use()
      .setUniform('eyePosition', UNIFORM_TYPE_VEC3, perspCamera.position)
      .setCamera(perspCamera)
      .draw(),
  )

  // ------------- Deferred directional lighting -------------
  if (CONFIG.directionalLight) {
    gl.activeTexture(gl.TEXTURE0)
    texturePosition.bind()
    gl.activeTexture(gl.TEXTURE1)
    textureNormal.bind()
    gl.activeTexture(gl.TEXTURE2)
    textureColor.bind()
    gl.activeTexture(gl.TEXTURE3)
    textureImage.bind()
    fullscreenQuadMesh
      .use()
      .setUniform('lightDirection', UNIFORM_TYPE_VEC3, [
        Math.sin(ts * 0.25),
        2,
        Math.cos(ts * 0.25),
      ])
      .setCamera(orthoCamera)
      .draw()
  }

  if (CONFIG.fxaa) {
    fxaaFramebuffer.unbind()
  }

  gl.disable(gl.BLEND)

  // ------------- FXAA pass -------------
  if (CONFIG.fxaa) {
    gl.activeTexture(gl.TEXTURE0)
    fxaaFramebuffer.texture.bind()
    fxaaMesh.use().setCamera(orthoCamera).draw()
  }

  // ------------- Debug -------------
  if (CONFIG.debug) {
    gl.activeTexture(gl.TEXTURE0)
    texturePosition.bind()
    debugPositionsMesh.use().setCamera(orthoCamera).draw()

    gl.activeTexture(gl.TEXTURE0)
    textureNormal.bind()
    debugNormalsMesh.use().setCamera(orthoCamera).draw()

    gl.activeTexture(gl.TEXTURE0)
    textureColor.bind()
    debugUvsMesh.use().setCamera(orthoCamera).draw()
  }

  stats.end()

  requestAnimationFrame(updateFrame)
}

function resize() {
  perspCamera.aspect = innerWidth / innerHeight
  perspCamera.updateProjectionMatrix()

  sizeCanvas()
}

function sizeCanvas() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}
