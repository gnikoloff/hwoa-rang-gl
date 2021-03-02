const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = devicePixelRatio
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

let oldTime = 0

let texture

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
gl.enable(gl.DEPTH_TEST)
// gl.enable(gl.CULL_FACE)
// gl.depthFunc(gl.LEQUAL)

const camera = new hwoaRangGL.PerspectiveCamera(
  (45 * Math.PI) / 180,
  innerWidth / innerHeight,
  0.1,
  100,
)
camera.position = [0, 0, 40]
camera.lookAt([0, 0, 0])

new hwoaRangGL.CameraController(camera)

const { indices, vertices, uv } = hwoaRangGL.GeometryUtils.createPlane({
  width: 16,
  height: 16 * 1.4828125,
})
const geometry = new hwoaRangGL.Geometry(gl)
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

const mesh = new hwoaRangGL.Mesh(gl, {
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

const image = new Image()
image.onload = () => {
  texture = new hwoaRangGL.Texture(gl, {
    image,
    isFlip: true,
    width: image.naturalWidth,
    height: image.naturalHeight,
  })
}
image.src = '../assets/images/texture-example.jpg'

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

  if (texture) {
    texture.bind()
    mesh.setCamera(camera).draw()
    texture.unbind()
  }

  stats.end()

  requestAnimationFrame(updateFrame)
}

function resize() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}
