const BOXES_COUNT = 6 * 6

const dpr = devicePixelRatio
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

const stats = new Stats()
document.body.appendChild(stats.domElement)

let oldTime = 0
let mouseX = 0
let mouseY = 0

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
gl.enable(gl.DEPTH_TEST)
// gl.enable(gl.CULL_FACE)
gl.depthFunc(gl.LEQUAL)

const camera = new hwoaRangGL.PerspectiveCamera(
  (45 * Math.PI) / 180,
  innerWidth / innerHeight,
  0.1,
  100,
)
camera.position = [0, 0, 10]
camera.lookAt([0, 0, 0])

const { indices, vertices, uv } = hwoaRangGL.GeometryUtils.createBox()
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
const mesh = new hwoaRangGL.InstancedMesh(gl, {
  geometry,
  instanceCount: BOXES_COUNT,
  vertexShaderSource: `
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
  `,
  fragmentShaderSource: `
    varying vec2 v_uv;
    void main () {
      gl_FragColor = vec4(0.0, v_uv, 1.0);
    }
  `,
})

const matrix = mat4.create()
const translateVec = vec3.create()
const scaleVec = vec4.create()

document.body.addEventListener('mousemove', (e) => {
  mouseX = (e.pageX / innerWidth) * 8 - 4
  mouseY = (1 - e.pageY / innerHeight) * 10 - 5
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

  for (let i = 0; i < BOXES_COUNT; i++) {
    const x = (i % 6) - 2.5
    const y = (i - x) / 6 - 3
    mat4.identity(matrix)
    vec3.set(translateVec, x, y, 0)
    mat4.translate(matrix, matrix, translateVec)

    const dx = mouseX - x
    const dy = mouseY - y

    const angle = Math.atan2(dx, dy)
    const dist = Math.sqrt(dx * dx + dy * dy)

    mat4.rotateX(matrix, matrix, angle)
    mat4.rotateZ(matrix, matrix, angle)

    const scale = dist * 0.2
    vec3.set(scaleVec, scale, scale, scale)
    mat4.scale(matrix, matrix, scaleVec)
    mesh.setMatrixAt(i, matrix)
  }

  mesh.setCamera(camera).draw()

  stats.end()

  requestAnimationFrame(updateFrame)
}

function resize() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}
