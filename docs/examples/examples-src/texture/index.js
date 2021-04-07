import Stats from 'stats-js'
import * as dat from 'dat.gui'
import throttle from 'lodash.throttle'

import {
  PerspectiveCamera,
  CameraController,
  Geometry,
  GeometryUtils,
  Mesh,
  Texture,
  getExtension,
  UNIFORM_TYPE_INT,
} from '../../../../dist/esm'

const gui = new dat.GUI()
gui.width = 420

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = Math.min(devicePixelRatio, 2)
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

const OPTIONS = {
  minFilter: 'LINEAR',
  magFilter: 'LINEAR',
  // anisotropy: 0,
}

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
gl.enable(gl.DEPTH_TEST)

const camera = new PerspectiveCamera(
  (45 * Math.PI) / 180,
  innerWidth / innerHeight,
  0.1,
  100,
)
camera.position = [0, 0, 26]
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
    diffuse: { type: UNIFORM_TYPE_INT, value: 0 },
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

mesh.use()

const texture = new Texture(gl).bind().fromSize(1, 1).setIsFlip()

const image = new Image()
image.onload = () => {
  texture.fromImage(image).generateMipmap().setAnisotropy(1)
}
image.src = window.location.href.includes('github')
  ? '/hwoa-rang-gl/examples/dist/assets/textures/zhang-kaiyv-mh2o8DuHaMM-unsplash.png'
  : '/examples/dist/assets/textures/zhang-kaiyv-mh2o8DuHaMM-unsplash.png'

document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
sizeCanvas()
window.addEventListener('resize', throttle(resize, 100))

gui
  .add(OPTIONS, 'minFilter', [
    'NEAREST',
    'LINEAR',
    'NEAREST_MIPMAP_NEAREST',
    'NEAREST_MIPMAP_LINEAR',
    'LINEAR_MIPMAP_NEAREST',
    'LINEAR_MIPMAP_LINEAR',
  ])
  .onChange((val) => {
    texture.setMinFilter(gl[val])
  })
gui.add(OPTIONS, 'magFilter', ['NEAREST', 'LINEAR']).onChange((val) => {
  texture.setMinFilter(gl[val])
})

{
  getExtension(gl, 'EXT_texture_filter_anisotropic') ||
    getExtension(gl, 'MOZ_EXT_texture_filter_anisotropic') ||
    getExtension(gl, 'WEBKIT_EXT_texture_filter_anisotropic')
}

function updateFrame() {
  stats.begin()

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.9, 0.9, 0.9, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

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
