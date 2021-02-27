const regularVertexShader = `

  attribute vec4 position;
  attribute vec2 uv;
  attribute vec3 normal;

  varying vec2 v_uv;
  varying vec3 v_normal;

  void main () {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
    v_uv = uv;
    v_normal = mat3(modelMatrix) * normal;
  }
`
const regularFragmentShader = `
  uniform vec3 lightDirection;

  varying vec2 v_uv;
  varying vec3 v_normal;

  void main () {
    vec3 normal = normalize(v_normal);
    float light = dot(normal, lightDirection);
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    gl_FragColor.rgb *= light;
  }
`

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = devicePixelRatio
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

let boxMesh
let sphereMesh
let oldTime = 0

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
camera.position = [0, 4, 6]
camera.lookAt([0, 0, 0])

new hwoaRangGL.CameraController(camera)

const lightDirection = vec3.create()
vec3.set(lightDirection, 0, 1, 1)
vec3.normalize(lightDirection, lightDirection)

{
  const { indices, vertices, uv, normal } = hwoaRangGL.GeometryUtils.createBox()
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
    .addAttribute('normal', {
      typedArray: normal,
      size: 3,
    })

  boxMesh = new hwoaRangGL.Mesh(gl, {
    geometry,
    uniforms: {
      lightDirection: { type: 'vec3', value: lightDirection },
    },
    vertexShaderSource: regularVertexShader,
    fragmentShaderSource: regularFragmentShader,
  })
}

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

  boxMesh.setUniform('lightDirection', 'vec3', lightDirection)
  boxMesh.setCamera(camera)
  boxMesh.setRotation(
    {
      y: 1,
    },
    ts,
  )
  boxMesh.updateModelMatrix()
  boxMesh.draw()

  stats.end()

  requestAnimationFrame(updateFrame)
}

function resize() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}
