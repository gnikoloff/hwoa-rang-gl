const SHAPE_COUNT = 50

const vertexShaderSource = `
  attribute vec4 position;
  attribute vec2 uv;

  varying vec2 v_uv;

  void main () {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
    v_uv = uv;
  }
`
const fragmentShaderSource = `
  uniform bool hovered;

  varying vec2 v_uv;

  void main () {
    if (hovered) {
      gl_FragColor = vec4(0.0, 1.0 - v_uv, 1.0);
    } else {
      gl_FragColor = vec4(v_uv, 0.0, 1.0);
    }
  }
`

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = devicePixelRatio
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

const pixelData = new Uint8Array(4)

let mouseX = -1
let mouseY = -1
let lastHoverId

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
camera.position = [0, 0, 40]
camera.lookAt([0, 0, 0])
new hwoaRangGL.CameraController(camera)

const mousePickTarget = new hwoaRangGL.RenderTarget(gl, {
  width: innerWidth,
  height: innerHeight,
})

const meshes = []
const hoverMeshes = []

const triangleGeometry = new hwoaRangGL.Geometry(gl)
const cubeGeometry = new hwoaRangGL.Geometry(gl)
const sphereGeometry = new hwoaRangGL.Geometry(gl)

const availableGeometries = [triangleGeometry, cubeGeometry, sphereGeometry]

{
  const vertices = new Float32Array([-0.5, -0.5, 0.5, -0.5, 0, 0.5])
  const uvs = new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0])
  triangleGeometry
    .addAttribute('position', { typedArray: vertices, size: 2 })
    .addAttribute('uv', { typedArray: uvs, size: 2 })
}

{
  const { vertices, uv, indices } = hwoaRangGL.GeometryUtils.createBox()
  cubeGeometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', { typedArray: vertices, size: 3 })
    .addAttribute('uv', { typedArray: uv, size: 2 })
}

{
  const { vertices, uv, indices } = hwoaRangGL.GeometryUtils.createSphere()
  sphereGeometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', { typedArray: vertices, size: 3 })
    .addAttribute('uv', { typedArray: uv, size: 2 })
}

for (let i = 0; i < SHAPE_COUNT; ++i) {
  const randGeometry =
    availableGeometries[Math.floor(Math.random() * availableGeometries.length)]

  const mesh = new hwoaRangGL.Mesh(gl, {
    geometry: randGeometry,
    uniforms: {
      hovered: { type: 'float', value: 0 },
    },
    vertexShaderSource,
    fragmentShaderSource,
  })
  const scale = 1 + Math.random() * 3

  const randX = (Math.random() * 2 - 1) * 14
  const randY = (Math.random() * 2 - 1) * 14
  const randZ = (Math.random() * 2 - 1) * 14

  const randRotX = (Math.random() * 2 - 1) * (Math.PI * 2)
  const randRotY = (Math.random() * 2 - 1) * (Math.PI * 2)
  const rotAngle = Math.random() * Math.PI

  mesh.setScale({ x: scale, y: scale, z: scale })
  mesh.setPosition({ x: randX, y: randY, z: randZ })
  mesh.setRotation({ x: randRotX, y: randRotY }, rotAngle)

  mesh.updateModelMatrix()
  meshes.push(mesh)

  const id = i + 1

  mesh.id = id

  const hoverMesh = new hwoaRangGL.Mesh(gl, {
    geometry: randGeometry,
    uniforms: {
      u_id: {
        type: 'vec4',
        value: [
          ((id >> 0) & 0xff) / 0xff,
          ((id >> 8) & 0xff) / 0xff,
          ((id >> 16) & 0xff) / 0xff,
          ((id >> 24) & 0xff) / 0xff,
        ],
      },
    },
    vertexShaderSource,
    fragmentShaderSource: `
      uniform vec4 u_id;
      void main () {
        gl_FragColor = u_id;
      }
    `,
  })

  hoverMesh.setScale({ x: scale, y: scale, z: scale })
  hoverMesh.setPosition({ x: randX, y: randY, z: randZ })
  hoverMesh.setRotation({ x: randRotX, y: randRotY }, rotAngle)
  hoverMesh.updateModelMatrix()
  hoverMeshes.push(hoverMesh)
}

document.body.appendChild(canvas)
document.body.addEventListener('mousemove', onMouseMove)
requestAnimationFrame(updateFrame)
resize()
window.addEventListener('resize', resize)

function onMouseMove(e) {
  mouseX = e.pageX
  mouseY = e.pageY
}

function updateFrame(ts) {
  ts /= 1000

  stats.begin()

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.9, 0.9, 0.9, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  meshes.forEach((mesh) => {
    mesh.setCamera(camera)
    mesh.draw()
  })

  mousePickTarget.bind()
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  hoverMeshes.forEach((mesh) => {
    mesh.setCamera(camera)
    mesh.draw()
  })

  const pixelX = (mouseX * canvas.width) / innerWidth
  const pixelY = canvas.height - (mouseY * canvas.height) / innerHeight - 1

  gl.readPixels(pixelX, pixelY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelData)

  const id =
    pixelData[0] +
    (pixelData[1] << 8) +
    (pixelData[2] << 16) +
    (pixelData[3] << 24)
  if (id > 0) {
    if (id !== lastHoverId) {
      meshes.forEach((mesh) => {
        mesh.setUniform('hovered', 'float', 0)
      })
    }
    const hoverMesh = meshes.find(({ id: ownID }) => ownID === id)
    hoverMesh.setUniform('hovered', 'float', 1)
    lastHoverId = id
  } else {
    meshes.forEach((mesh) => {
      mesh.setUniform('hovered', 'float', 0)
    })
  }

  mousePickTarget.unbind()

  stats.end()

  requestAnimationFrame(updateFrame)
}

function resize() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}
