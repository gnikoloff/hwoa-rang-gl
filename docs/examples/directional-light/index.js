const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = devicePixelRatio
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

let boxMesh
let floorHelperMesh
let texture
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
camera.position = [4, 3, 3]
camera.lookAt([0, 0, 0])

new hwoaRangGL.CameraController(camera, canvas)

const lightDirection = vec3.create()
vec3.set(lightDirection, 1, 1, 1)
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
      diffuse: { type: 'int', value: 0 },
      lightDirection: { type: 'vec3', value: lightDirection },
    },
    vertexShaderSource: `
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
    `,
    fragmentShaderSource: `
      uniform sampler2D diffuse;
      uniform vec3 lightDirection;

      varying vec2 v_uv;
      varying vec3 v_normal;

      void main () {
        vec3 normal = normalize(v_normal);
        float light = dot(normal, lightDirection);
        gl_FragColor = texture2D(diffuse, v_uv);
        gl_FragColor.rgb *= light;
      }
    `,
  })
  boxMesh.setPosition({
    y: 0.5,
  })
}

const image = new Image()
image.onload = () => {
  texture = new hwoaRangGL.Texture(gl, {
    image,
    isFlip: true,
    width: image.naturalWidth,
    height: image.naturalHeight,
  })
}
image.src = '../assets/images/webgl-logo-pot.png'

// Floor helper
{
  const FLOOR_HELPER_LINES_COUNT = 20
  const FLOOR_HELPER_RADIUS = 10
  const vertexCount = FLOOR_HELPER_LINES_COUNT * FLOOR_HELPER_LINES_COUNT * 2
  const vertices = new Float32Array(vertexCount * 3)

  const scale = FLOOR_HELPER_RADIUS / FLOOR_HELPER_LINES_COUNT

  for (let i = 0; i <= FLOOR_HELPER_LINES_COUNT; i += 2) {
    {
      const x1 = i * scale
      const y1 = 0
      const x2 = i * scale
      const y2 = FLOOR_HELPER_RADIUS
      vertices[i * 6 + 0] = x1 - FLOOR_HELPER_RADIUS / 2
      vertices[i * 6 + 1] = y1 - FLOOR_HELPER_RADIUS / 2
      vertices[i * 6 + 2] = 0
      vertices[i * 6 + 3] = x2 - FLOOR_HELPER_RADIUS / 2
      vertices[i * 6 + 4] = y2 - FLOOR_HELPER_RADIUS / 2
      vertices[i * 6 + 5] = 0
    }
    {
      const x1 = 0
      const y1 = i * scale
      const x2 = FLOOR_HELPER_RADIUS
      const y2 = i * scale
      vertices[i * 6 + 6] = x1 - FLOOR_HELPER_RADIUS / 2
      vertices[i * 6 + 7] = y1 - FLOOR_HELPER_RADIUS / 2
      vertices[i * 6 + 8] = 0
      vertices[i * 6 + 9] = x2 - FLOOR_HELPER_RADIUS / 2
      vertices[i * 6 + 10] = y2 - FLOOR_HELPER_RADIUS / 2
      vertices[i * 6 + 11] = 0
    }
  }

  const geometry = new hwoaRangGL.Geometry(gl)
  geometry.addAttribute('position', {
    typedArray: vertices,
    size: 3,
  })
  floorHelperMesh = new hwoaRangGL.Mesh(gl, {
    geometry,
    vertexShaderSource: `
      attribute vec4 position;
      void main () {
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
      }
    `,
    fragmentShaderSource: `
      void main () {
        gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
      }
    `,
  })
  floorHelperMesh.drawMode = gl.LINES
  floorHelperMesh.setRotation(
    {
      x: 1,
    },
    Math.PI / 2,
  )
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
  gl.clearColor(0.1, 0.1, 0.1, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  if (texture) {
    texture.bind()
  }
  boxMesh
    .setUniform('lightDirection', 'vec3', lightDirection)
    .setCamera(camera)
    .setRotation(
      {
        y: 1,
      },
      ts * 0.5,
    )
    .draw()

  floorHelperMesh.setCamera(camera).draw()

  stats.end()

  requestAnimationFrame(updateFrame)
}

function resize() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}
