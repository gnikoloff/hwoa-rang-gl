import Stats from 'stats-js'
import * as dat from 'dat.gui'
import { vec3, vec4, mat4 } from 'gl-matrix'
import throttle from 'lodash.throttle'

import {
  PerspectiveCamera,
  Geometry,
  GeometryUtils,
  Mesh,
  InstancedMesh,
  Framebuffer,
  OrthographicCamera,
  UNIFORM_TYPE_FLOAT,
  UNIFORM_TYPE_VEC2,
  UNIFORM_TYPE_INT,
} from '../../../../dist/esm'

const BOXES_VERTEX_SHADER = `
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
`

const BOXES_FRAGMENT_SHADER = `
  uniform bool debugMode;
  varying vec2 v_uv;
  void main () {
    if (debugMode) {
      gl_FragColor = vec4(v_uv.x, 0.1, v_uv.y, 1.0);
    } else {
      gl_FragColor = vec4(0.02, 0.02, 0.02, 1);
    }
  }
`

const VERTEX_SHADER_SPHERE = `
  attribute vec4 position;

  void main () {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
  }
`

const FRAGMENT_SHADER_SPHERE = `
  void main () {
    gl_FragColor = vec4(1.0);
  }
`

const VERTEX_SHADER_BLUR = `
  attribute vec4 position;
  attribute vec2 uv;

  varying vec2 v_uv;

  void main () {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;

    v_uv = uv;
  }
`

const FRAGMENT_SHADER_BLUR = `
  uniform sampler2D diffuse;
  uniform sampler2D mask;
  uniform vec2 blurDirection;
  uniform float factor;
  uniform vec2 resolution;

  varying vec2 v_uv;

  vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
    vec4 color = vec4(0.0);
    vec2 off1 = vec2(1.3846153846) * direction;
    vec2 off2 = vec2(3.2307692308) * direction;
    color += texture2D(image, uv) * 0.2270270270;
    color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
    color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
    color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
    color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
    return color;
  }

  void main () {
    vec4 maskColor = texture2D(mask, v_uv);
    gl_FragColor = mix(
      blur9(diffuse, v_uv, resolution, blurDirection) * factor,
      vec4(0.1, 0.1, 0.1, 1.0),
      maskColor.r
    );
  }
`

const COUNT_SIDE = 12
const BOXES_COUNT = COUNT_SIDE * COUNT_SIDE
const BLUR_ITERATIONS = 24
const BACKGROUND_COLOR = [0.02, 0.02, 0.02, 1]
const SCALE_DOWN_POSTFX = 4

const OPTS = {
  debugMode: false,
  spread: 3,
  factor: 1.1,
}

const gui = new dat.GUI()

const dpr = Math.min(devicePixelRatio, 2)
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

const stats = new Stats()
document.body.appendChild(stats.domElement)

let oldTime = 0

let boxesMesh
let sphereMesh
let planeMesh

// gl.enable(gl.BLEND)
// gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
gl.enable(gl.DEPTH_TEST)
gl.enable(gl.CULL_FACE)
gl.depthFunc(gl.LEQUAL)

const perspCamera = new PerspectiveCamera(
  (45 * Math.PI) / 180,
  innerWidth / innerHeight,
  0.1,
  100,
)
perspCamera.position = [0, 0, 10]
perspCamera.lookAt([0, 0, 0])

const orthoCamera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 2)
orthoCamera.position = [0, 0, 1]
orthoCamera.lookAt([0, 0, 0])

let renderTargetBlurX = new Framebuffer(gl, {
  width: innerWidth / SCALE_DOWN_POSTFX,
  height: innerHeight / SCALE_DOWN_POSTFX,
})
let renderTargetBlurY = new Framebuffer(gl, {
  width: innerWidth / SCALE_DOWN_POSTFX,
  height: innerHeight / SCALE_DOWN_POSTFX,
})

/* ----- Instanced Boxes ------ */
{
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
  boxesMesh = new InstancedMesh(gl, {
    geometry,
    instanceCount: BOXES_COUNT,
    vertexShaderSource: BOXES_VERTEX_SHADER,
    fragmentShaderSource: BOXES_FRAGMENT_SHADER,
  })
}

/* ----- Sphere ------ */
{
  const { indices, vertices } = GeometryUtils.createSphere({
    radius: 2,
    widthSegments: 24,
    heightSegments: 24,
  })
  const geometry = new Geometry(gl)
  geometry.addIndex({ typedArray: indices }).addAttribute('position', {
    typedArray: vertices,
    size: 3,
  })
  sphereMesh = new Mesh(gl, {
    geometry,
    vertexShaderSource: VERTEX_SHADER_SPHERE,
    fragmentShaderSource: FRAGMENT_SHADER_SPHERE,
  })
}

/* ----- Fullscreen Quad ------ */
{
  const { indices, vertices, uv } = GeometryUtils.createPlane({
    width: 1,
    height: 1,
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
  planeMesh = new Mesh(gl, {
    geometry,
    uniforms: {
      diffuse: { type: UNIFORM_TYPE_INT, value: 0 },
      mask: { type: UNIFORM_TYPE_INT, value: 1 },
      blurDirection: { type: UNIFORM_TYPE_VEC2, value: [0, 1] },
      factor: { type: UNIFORM_TYPE_FLOAT, value: OPTS.factor },
      resolution: { type: UNIFORM_TYPE_VEC2, value: [innerWidth, innerHeight] },
    },
    vertexShaderSource: VERTEX_SHADER_BLUR,
    fragmentShaderSource: FRAGMENT_SHADER_BLUR,
  })
}

const matrix = mat4.create()
const translateVec = vec3.create()
const scaleVec = vec4.create()

for (let i = 0; i < BOXES_COUNT; i++) {
  const x = (i % COUNT_SIDE) - COUNT_SIDE / 2 + (Math.random() * 2 - 1) * 3
  const y = (i - x) / COUNT_SIDE - COUNT_SIDE / 2 + (Math.random() * 2 - 1) * 3
  mat4.identity(matrix)
  vec3.set(translateVec, x, y, 0)
  mat4.translate(matrix, matrix, translateVec)

  const angle = Math.random() * Math.PI * 2

  mat4.rotateX(matrix, matrix, angle)
  mat4.rotateZ(matrix, matrix, angle)

  const scale = 0.5 + Math.random() * 0.7
  vec3.set(scaleVec, scale, scale, scale)
  mat4.scale(matrix, matrix, scaleVec)
  boxesMesh.setMatrixAt(i, matrix)
}

gui.add(OPTS, 'debugMode').onChange((val) => {
  boxesMesh.use().setUniform('debugMode', UNIFORM_TYPE_FLOAT, val)
})
gui
  .add(OPTS, 'factor')
  .min(1)
  .max(1.15)
  .step(0.01)
  .onChange((val) => {
    planeMesh.use().setUniform('factor', UNIFORM_TYPE_FLOAT, val)
  })
gui.add(OPTS, 'spread').min(1).max(5).step(0.5)

document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
sizeCanvas()
window.addEventListener('resize', throttle(resize, 100))

function updateFrame(ts) {
  ts /= 1000
  const dt = ts - oldTime
  oldTime = ts

  stats.begin()

  let writeBuffer = renderTargetBlurX
  let readBuffer = renderTargetBlurY

  if (!OPTS.debugMode) {
    renderTargetBlurX.bind()
    gl.clearColor(...BACKGROUND_COLOR)
    gl.viewport(
      0,
      0,
      innerWidth / SCALE_DOWN_POSTFX,
      innerHeight / SCALE_DOWN_POSTFX,
    )
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  } else {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    gl.clearColor(...BACKGROUND_COLOR)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

  sphereMesh
    .use()
    .setCamera(perspCamera)
    .setPosition({
      x: Math.sin(ts) * 4,
      y: Math.cos(ts) * 3,
      z: -5,
    })
    .draw()

  boxesMesh.use().setCamera(perspCamera).draw()

  if (!OPTS.debugMode) {
    renderTargetBlurX.unbind()

    for (let i = 0; i < BLUR_ITERATIONS; i++) {
      readBuffer.bind()
      writeBuffer.texture.bind()
      const radius = BLUR_ITERATIONS - i * OPTS.spread - 1
      planeMesh
        .use()
        .setCamera(orthoCamera)
        .setUniform(
          'blurDirection',
          UNIFORM_TYPE_VEC2,
          i % 2 === 0 ? [radius, 0] : [0, radius],
        )
        .draw()
      // readBuffer.unbindTexture()

      let t = writeBuffer
      writeBuffer = readBuffer
      readBuffer = t
    }

    writeBuffer.unbind()

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    gl.clearColor(...BACKGROUND_COLOR)
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    readBuffer.texture.bind()

    planeMesh.use().draw()
  }

  // readBuffer.unbindTexture()

  stats.end()

  requestAnimationFrame(updateFrame)
}

function resize() {
  const aspect = innerWidth / innerHeight

  perspCamera.aspect = aspect
  perspCamera.updateProjectionMatrix()

  renderTargetBlurX.updateWithSize(
    innerWidth / SCALE_DOWN_POSTFX,
    innerHeight / SCALE_DOWN_POSTFX,
    true,
  )
  renderTargetBlurY.updateWithSize(
    innerWidth / SCALE_DOWN_POSTFX,
    innerHeight / SCALE_DOWN_POSTFX,
    true,
  )
  // renderTargetBlurX.delete()
  // renderTargetBlurY.delete()

  // renderTargetBlurX = new Framebuffer(gl, {
  //   width: innerWidth / SCALE_DOWN_POSTFX,
  //   height: innerHeight / SCALE_DOWN_POSTFX,
  // })
  // renderTargetBlurY = new Framebuffer(gl, {
  //   width: innerWidth / SCALE_DOWN_POSTFX,
  //   height: innerHeight / SCALE_DOWN_POSTFX,
  // })
  planeMesh.setUniform('resolution', UNIFORM_TYPE_VEC2, [
    innerWidth,
    innerHeight,
  ])

  sizeCanvas()
}

function sizeCanvas() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}
