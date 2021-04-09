import Stats from 'stats-js'
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
  UNIFORM_TYPE_INT,
} from '../../../../dist/esm'

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = Math.min(devicePixelRatio, 2)
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

let drawMesh
let postMesh

gl.clearColor(0.0, 0.0, 0.0, 1.0)
gl.enable(gl.DEPTH_TEST)
gl.depthFunc(gl.LEQUAL)
gl.blendFunc(gl.ONE, gl.ONE)

const camera = new PerspectiveCamera(
  (45 * Math.PI) / 180,
  innerWidth / innerHeight,
  0.1,
  100,
)
camera.position = [0, 0, 5]
camera.lookAt([0, 0, 0])

const orthoCamera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 2)
orthoCamera.position = [0, 0, 1]
orthoCamera.lookAt([0, 0, 0])

new CameraController(camera, canvas)

const ext = getExtension(gl, 'WEBGL_draw_buffers')
if (!ext) {
  // TODO: handle missing extension
}

const ext2 = getExtension(gl, 'OES_texture_float')
if (!ext2) {
  // TODO: handle missing extension
}

const ext3 = getExtension(gl, 'WEBGL_depth_texture')
if (!ext3) {
  // TODO: handle missing extension
}

const framebuffer = gl.createFramebuffer()
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)

const texturePosition = new Texture(gl, { type: gl.FLOAT, format: gl.RGBA })
  .bind()
  .fromSize(innerWidth, innerHeight)

gl.framebufferTexture2D(
  gl.FRAMEBUFFER,
  ext.COLOR_ATTACHMENT0_WEBGL,
  gl.TEXTURE_2D,
  texturePosition.getTexture(),
  0,
)

const textureNormal = new Texture(gl, { type: gl.FLOAT, format: gl.RGBA })
  .bind()
  .fromSize(innerWidth, innerHeight)

gl.framebufferTexture2D(
  gl.FRAMEBUFFER,
  ext.COLOR_ATTACHMENT1_WEBGL,
  gl.TEXTURE_2D,
  textureNormal.getTexture(),
  0,
)

const textureColor = new Texture(gl, { type: gl.FLOAT, format: gl.RGBA })
  .bind()
  .fromSize(innerWidth, innerHeight)

gl.framebufferTexture2D(
  gl.FRAMEBUFFER,
  ext.COLOR_ATTACHMENT2_WEBGL,
  gl.TEXTURE_2D,
  textureColor.getTexture(),
  0,
)

const textureDepth = new Texture(gl, {
  type: gl.UNSIGNED_SHORT,
  format: gl.DEPTH_COMPONENT,
})
  .bind()
  .fromSize(innerWidth, innerHeight)

gl.framebufferTexture2D(
  gl.FRAMEBUFFER,
  gl.DEPTH_ATTACHMENT,
  gl.TEXTURE_2D,
  textureDepth.getTexture(),
  0,
)

if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
  console.log('cant use framebuffer!')
}

ext.drawBuffersWEBGL([
  ext.COLOR_ATTACHMENT0_WEBGL, // gl_FragData[0]
  ext.COLOR_ATTACHMENT1_WEBGL, // gl_FragData[1]
  ext.COLOR_ATTACHMENT2_WEBGL, // gl_FragData[2]
])

gl.bindFramebuffer(gl.FRAMEBUFFER, null)

{
  const { indices, vertices, uv, normal } = GeometryUtils.createBox()
  const geometry = new Geometry(gl)
  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', { typedArray: vertices, size: 3 })
    .addAttribute('uv', { typedArray: uv, size: 2 })
    .addAttribute('normal', { typedArray: normal, size: 3 })

  drawMesh = new Mesh(gl, {
    geometry,
    vertexShaderSource: `
      attribute vec4 position;
      attribute vec2 uv;
      attribute vec3 normal;

      varying vec2 v_uv;
      varying vec3 v_normal;
      varying vec3 v_position;

      void main () {
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;

        v_uv = uv;
        v_normal = normal;
        v_position = gl_Position.xyz;
      }
    `,
    fragmentShaderSource: `
      #extension GL_EXT_draw_buffers : require
      precision highp float;
      
      varying vec2 v_uv;
      varying vec3 v_normal;
      varying vec3 v_position;

      void main () {
        vec4 color = vec4(1.0, 1.0 - v_uv.x, v_uv.y, 1.0);
        color.rgb += abs(v_normal);

        gl_FragData[0] = vec4(v_position, 1.0);
        gl_FragData[1] = vec4(normalize(v_normal), 1.0);
        gl_FragData[2] = color;
      }
    `,
  })
}

{
  const { indices, vertices, uv } = GeometryUtils.createPlane()
  const geometry = new Geometry(gl)
  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', { typedArray: vertices, size: 3 })
    .addAttribute('uv', { typedArray: uv, size: 2 })

  postMesh = new Mesh(gl, {
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
      precision highp float;

      uniform sampler2D diffuse;

      varying vec2 v_uv;

      void main () {
        gl_FragColor = texture2D(diffuse, v_uv);
      }
    `,
  })
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

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  drawMesh.use().setCamera(camera).draw()
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)

  textureColor.bind()
  postMesh.use().setCamera(orthoCamera).draw()

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
