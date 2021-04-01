import Stats from 'stats-js'

import {
  PerspectiveCamera,
  CameraController,
  Geometry,
  GeometryUtils,
  Mesh,
  Framebuffer,
} from '../../../../dist/esm'

const fullscreenQuadVertShader = `
  attribute vec4 position;
  attribute vec2 uv;

  varying vec2 v_uv;

  void main () {
    gl_Position = position;
    v_uv = uv;
  }
`

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = devicePixelRatio
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

const camera = new PerspectiveCamera(
  (45 * Math.PI) / 180,
  innerWidth / innerHeight,
  0.1,
  100,
)
camera.position = [0, 0, 10]
camera.lookAt([0, 0, 0])

new CameraController(camera, canvas)

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
  vertexShaderSource: `
    attribute vec4 position;
    attribute vec2 uv;

    varying vec2 v_uv;

    void main () {
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
      v_uv = uv;
    }
  `,
  fragmentShaderSource: `
    varying vec2 v_uv;
    void main () {
      gl_FragColor = vec4(v_uv.x, 0.0, v_uv.y, 1.0);
    }
  `,
})

const {
  vertices: fullscreenQuadVertices,
  uv: fullscreenQuadUvs,
} = GeometryUtils.createFullscreenQuad()
const geometry = new Geometry(gl)

geometry
  .addAttribute('position', {
    typedArray: fullscreenQuadVertices,
    size: 2,
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
  vertexShaderSource: fullscreenQuadVertShader,
  fragmentShaderSource: `
    uniform sampler2D diffuse;
    varying vec2 v_uv;

    void main () {
      vec4 fadeColor = vec4(0.9, 0.9, 0.9, 1.0);
      gl_FragColor = mix(texture2D(diffuse, v_uv), fadeColor, 0.2);
    }
  `,
})

const resultMesh = new Mesh(gl, {
  geometry,
  uniforms: {
    diffuse: { type: 'int', value: 0 },
  },
  vertexShaderSource: fullscreenQuadVertShader,
  fragmentShaderSource: `
    uniform sampler2D diffuse;
    varying vec2 v_uv;

    void main () {
      gl_FragColor = texture2D(diffuse, v_uv);
    }
  `,
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
resize()
window.addEventListener('resize', resize)

function updateFrame(ts) {
  ts /= 1000
  const dt = ts - oldTime
  oldTime = ts

  stats.begin()

  mousePos.x += (mousePosTarget.x - mousePos.x) * (dt * 2)
  mousePos.y += (mousePosTarget.y - mousePos.y) * (dt * 2)

  const dx = -mousePosTarget.x
  const dy = -mousePosTarget.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  boxMesh
    .use()
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
    fadeMesh.use().draw()

    boxMesh.use().setCamera(camera).draw()

    currentRenderTarget.unbind()
  }

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.9, 0.9, 0.9, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  currentRenderTarget.texture.bind()
  resultMesh.use().draw()

  const temp = prevRenderTarget
  prevRenderTarget = currentRenderTarget
  currentRenderTarget = temp

  stats.end()

  requestAnimationFrame(updateFrame)
}

function resize() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}
