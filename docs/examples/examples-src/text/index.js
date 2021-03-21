import Stats from 'stats-js'
import * as dat from 'dat.gui'

import {
  PerspectiveCamera,
  CameraController,
  Geometry,
  GeometryUtils,
  Mesh,
  Texture,
} from '../../../../dist/esm'

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = devicePixelRatio
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

const OPTIONS = {
  debugMode: false,
}
const gui = new dat.GUI()

let oldTime = 0

const texCanvas = document.createElement('canvas')
{
  texCanvas.setAttribute(
    'style',
    `
    display: none;
    position: fixed;
    bottom: 0;
    right: 0;
    max-width: 256px;
  `,
  )
  document.body.appendChild(texCanvas)

  const texCtx = texCanvas.getContext('2d')
  texCanvas.width = 1024
  texCanvas.height = 1024
  const text =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'

  const lineHeight = 62
  const gapWidth = 14

  texCtx.fillStyle = 'red'

  texCtx.font = '110px Helvetica'
  texCtx.fillText('This is a headline', 0, 120)

  texCtx.font = '40px Helvetica'

  let accTextX = 0
  let accTextY = 220
  text.split(' ').forEach((word) => {
    const wordWidth = texCtx.measureText(word).width
    if (accTextX + wordWidth + gapWidth >= texCanvas.width) {
      accTextX = 0
      accTextY += lineHeight
      texCtx.fillText(word, accTextX, accTextY)
      accTextX += wordWidth + gapWidth
    } else {
      texCtx.fillText(word, accTextX, accTextY)
      accTextX += wordWidth + gapWidth
    }
  })

  texCtx.font = '40px monospace'
  texCtx.fillText('monospace text', 0, accTextY + 160)
  texCtx.font = '40px cursive'
  texCtx.fillText('cursive text', 0, accTextY + 240)
  texCtx.font = '40px fantasy'
  texCtx.fillText('fantasy text', 0, accTextY + 320)
  texCtx.font = '40px emoji'
  texCtx.fillText('😍 😘 😚 😜 😂 😝 😳 😁 😣 😢 😭', 0, accTextY + 400)
}

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

const texture = new Texture(gl, {
  format: gl.RGBA,
  internalFormat: gl.RGBA,
  minFilter: gl.LINEAR,
  magFilter: gl.LINEAR,
})
texture.bind().setIsFlip().fromImage(texCanvas)

const camera = new PerspectiveCamera(
  (45 * Math.PI) / 180,
  innerWidth / innerHeight,
  0.1,
  100,
)
camera.position = [0, 0, 25]
camera.lookAt([0, 0, 0])

new CameraController(camera, canvas)

const { indices, vertices, uv } = GeometryUtils.createPlane({
  width: 16,
  height: 16,
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

const mesh = new Mesh(gl, {
  geometry,
  uniforms: {
    diffuse: { type: 'int', value: 0 },
  },
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
    uniform sampler2D diffuse;

    varying vec2 v_uv;

    void main () {
      gl_FragColor = texture2D(diffuse, v_uv);
    }
  `,
})

gui.add(OPTIONS, 'debugMode').onChange((debugMode) => {
  texCanvas.style.display = debugMode ? 'block' : 'none'
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

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.9, 0.9, 0.9, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  texture.bind()
  mesh.setCamera(camera).draw()
  texture.unbind()

  stats.end()

  requestAnimationFrame(updateFrame)
}

function resize() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}
