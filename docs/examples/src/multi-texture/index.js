import Stats from 'stats-js'
import throttle from 'lodash.throttle'

import {
  PerspectiveCamera,
  CameraController,
  Geometry,
  GeometryUtils,
  Mesh,
  Texture,
  UNIFORM_TYPE_INT,
} from '../../../../dist/esm'

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = Math.min(devicePixelRatio, 2)
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

const colors = [
  '#2ecc71',
  '#e67e22',
  '#f1c40f',
  '#2980b9',
  '#c0392b',
  '#34495e',
]
const textures = []
const meshes = []

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
gl.enable(gl.DEPTH_TEST)
// gl.enable(gl.CULL_FACE)
// gl.depthFunc(gl.LEQUAL)

const camera = new PerspectiveCamera(
  (45 * Math.PI) / 180,
  innerWidth / innerHeight,
  0.1,
  100,
)
camera.position = [20, 20, 20]
camera.lookAt([0, 0, 0])

new CameraController(camera, canvas)

const sidesData = GeometryUtils.createBox({
  width: 10,
  height: 10,
  depth: 10,
  separateFaces: true,
})
for (let i = 0; i < sidesData.length; i++) {
  const side = sidesData[i]
  const geometry = new Geometry(gl)

  const { indices, vertices, uv } = side

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
  meshes.push(mesh)

  const tex = new Texture(gl, {
    minFilter: gl.LINEAR_MIPMAP_LINEAR,
    magFilter: gl.LINEAR,
  })
    .bind()
    .setIsFlip()
    .fromImage(createNumCanvas(i))
    .generateMipmap()

  textures.push(tex)
}

document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
sizeCanvas()
window.addEventListener('resize', throttle(resize, 100))

function updateFrame() {
  stats.begin()

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.9, 0.9, 0.9, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  meshes.forEach((mesh, i) => {
    const texture = textures[i]
    texture.bind()
    mesh.use().setCamera(camera).draw()
    texture.unbind()
  })

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

function createNumCanvas(num) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = 512
  canvas.height = 512
  // document.body.appendChild(canvas)
  // canvas.setAttribute(
  //   'style',
  //   `
  //   position: fixed;
  //   top: 24px;
  //   left: 24px;
  //   z-index: 999;
  // `,
  // )

  ctx.fillStyle = colors[num]
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.font = '256px Arial'
  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.fillText(num + 1, canvas.width / 2, canvas.height / 2 + 76)
  return canvas
}
