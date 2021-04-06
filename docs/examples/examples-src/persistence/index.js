import Stats from 'stats-js'
import throttle from 'lodash.throttle'

import {
  PerspectiveCamera,
  OrthographicCamera,
  CameraController,
  Geometry,
  GeometryUtils,
  Mesh,
  Framebuffer,
} from '../../../../dist/esm'

const QUAD_VERTEX_SHADER = `
  attribute vec4 position;
  attribute vec2 uv;

  varying vec2 v_uv;

  void main () {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
    v_uv = uv;
  }
`

const FADE_QUAD_FRAGMENT_SHADER = `
  uniform sampler2D diffuse;
  varying vec2 v_uv;

  void main () {
    vec4 fadeColor = vec4(0.9, 0.9, 0.9, 1.0);
    gl_FragColor = mix(texture2D(diffuse, v_uv), fadeColor, 0.2);
  }
`

const RESULT_QUAD_FRAGMENT_SHADER = `
  uniform sampler2D diffuse;
  varying vec2 v_uv;

  void main () {
    gl_FragColor = texture2D(diffuse, v_uv);
  }
`

const BOXES_VERTEX_SHADER = `
  attribute vec4 position;
  attribute vec2 uv;

  varying vec2 v_uv;

  void main () {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
    v_uv = uv;
  }
`

const BOXES_FRAGMENT_SHADER = `
  varying vec2 v_uv;
  void main () {
    gl_FragColor = vec4(v_uv.x, 0.0, v_uv.y, 1.0);
  }
`

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = Math.min(devicePixelRatio, 2)
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

const mousePos = { x: 0, y: 0 }
const mousePosTarget = { ...mousePos }

let prevRenderTarget = new Framebuffer(gl, {
  width: innerWidth,
  height: innerHeight,
})
let currentRenderTarget = new Framebuffer(gl, {
  width: innerWidth,
  height: innerHeight,
})
let oldTime = 0

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
// gl.enable(gl.DEPTH_TEST)
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

new CameraController(perspCamera, canvas)

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

const boxMesh = new Mesh(gl, {
  geometry: boxGeometry,
  vertexShaderSource: BOXES_VERTEX_SHADER,
  fragmentShaderSource: BOXES_FRAGMENT_SHADER,
})

const {
  indices: fullscreenQuadIndices,
  vertices: fullscreenQuadVertices,
  uv: fullscreenQuadUvs,
} = GeometryUtils.createPlane({
  width: 1,
  height: 1,
})

const geometry = new Geometry(gl)

geometry
  .addIndex({ typedArray: fullscreenQuadIndices })
  .addAttribute('position', {
    typedArray: fullscreenQuadVertices,
    size: 3,
  })
  .addAttribute('uv', {
    typedArray: fullscreenQuadUvs,
    size: 2,
  })

const fadeMesh = new Mesh(gl, {
  geometry,
  uniforms: {
    diffuse: { type: 'int', value: 0 },
  },
  vertexShaderSource: QUAD_VERTEX_SHADER,
  fragmentShaderSource: FADE_QUAD_FRAGMENT_SHADER,
})

const resultMesh = new Mesh(gl, {
  geometry,
  uniforms: {
    diffuse: { type: 'int', value: 0 },
  },
  vertexShaderSource: QUAD_VERTEX_SHADER,
  fragmentShaderSource: RESULT_QUAD_FRAGMENT_SHADER,
})

document.body.addEventListener('mousemove', (e) => {
  let pointerX = e.pageX
  if (!pointerX) {
    pointerX = e.changedTouches[0].pageX
  }
  let pointerY = e.pageY
  if (!pointerY) {
    pointerY = e.changedTouches[0].pageY
  }
  mousePosTarget.x = (pointerX / innerWidth) * 2 - 1
  mousePosTarget.y = 2 - (pointerY / innerHeight) * 2 - 1
})

document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
sizeCanvas()
window.addEventListener('resize', throttle(resize, 100))

function updateFrame(ts) {
  ts /= 1000
  const dt = ts - oldTime
  oldTime = ts

  stats.begin()

  mousePos.x += (mousePosTarget.x - mousePos.x) * dt
  mousePos.y += (mousePosTarget.y - mousePos.y) * dt

  const dx = -mousePosTarget.x
  const dy = -mousePosTarget.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  boxMesh
    .setRotation({ x: mousePos.x, y: mousePos.y, z: mousePos.y }, dist)
    .setPosition({
      x: mousePos.x * 5,
      y: mousePos.y * 2,
      z: Math.sin(mousePos.y * Math.PI * 1.25) * 2,
    })

  {
    gl.viewport(0, 0, innerWidth, innerHeight)
    currentRenderTarget.bind()
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    prevRenderTarget.texture.bind()
    fadeMesh.use().setCamera(orthoCamera).draw()

    boxMesh.use().setCamera(perspCamera).draw()

    currentRenderTarget.unbind()
  }

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.9, 0.9, 0.9, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  currentRenderTarget.texture.bind()
  resultMesh.use().setCamera(orthoCamera).draw()

  const temp = prevRenderTarget
  prevRenderTarget = currentRenderTarget
  currentRenderTarget = temp

  stats.end()

  requestAnimationFrame(updateFrame)
}

function resize() {
  perspCamera.aspect = innerWidth / innerHeight
  perspCamera.updateProjectionMatrix()

  orthoCamera.updateProjectionMatrix()

  prevRenderTarget.updateWithSize(innerWidth, innerHeight, true)
  currentRenderTarget.updateWithSize(innerWidth, innerHeight, true)

  sizeCanvas()
}

function sizeCanvas() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}
