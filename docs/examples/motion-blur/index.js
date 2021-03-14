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

let prevRenderTarget = new hwoaRangGL.RenderTarget(gl, {
  width: innerWidth,
  height: innerHeight,
})
let currentRenderTarget = new hwoaRangGL.RenderTarget(gl, {
  width: innerWidth,
  height: innerHeight,
})
let oldTime = 0

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
// gl.enable(gl.DEPTH_TEST)
gl.enable(gl.CULL_FACE)
gl.depthFunc(gl.LEQUAL)

const camera = new hwoaRangGL.PerspectiveCamera(
  (45 * Math.PI) / 180,
  innerWidth / innerHeight,
  0.1,
  100,
)
camera.position = [0, 0, 10]
camera.lookAt([0, 0, 0])

new hwoaRangGL.CameraController(camera, canvas)

const { indices, vertices, uv } = hwoaRangGL.GeometryUtils.createBox()
const boxGeometry = new hwoaRangGL.Geometry(gl)
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

const boxMesh = new hwoaRangGL.Mesh(gl, {
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
} = hwoaRangGL.GeometryUtils.createFullscreenQuad()
const geometry = new hwoaRangGL.Geometry(gl)

geometry
  .addAttribute('position', {
    typedArray: fullscreenQuadVertices,
    size: 2,
  })
  .addAttribute('uv', {
    typedArray: fullscreenQuadUvs,
    size: 2,
  })

const fadeMesh = new hwoaRangGL.Mesh(gl, {
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

const resultMesh = new hwoaRangGL.Mesh(gl, {
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
  mousePosTarget.x = (e.pageX / innerWidth) * 2 - 1
  mousePosTarget.y = 2 - (e.pageY / innerHeight) * 2 - 1
})
document.body.addEventListener('mousemove', (e) => {
  e.preventDefault()
  mousePosTarget.x = (e.changedTouches[0].pageX / innerWidth) * 2 - 1
  mousePosTarget.y = 2 - (e.changedTouches[0].pageY / innerHeight) * 2 - 1
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

    prevRenderTarget.bindTexture()
    fadeMesh.draw()

    boxMesh.setCamera(camera).draw()

    currentRenderTarget.unbind()
  }

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.9, 0.9, 0.9, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  currentRenderTarget.bindTexture()
  resultMesh.draw()

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
