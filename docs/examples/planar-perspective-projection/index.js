const UP_VECTOR = [0, 1, 0]

const CUBE_VERTICES = [
  0,
  0,
  -1,
  1,
  0,
  -1,
  0,
  1,
  -1,
  1,
  1,
  -1,
  0,
  0,
  1,
  1,
  0,
  1,
  0,
  1,
  1,
  1,
  1,
  1,
]

const CUBE_INDICES = [
  0,
  1,
  1,
  3,
  3,
  2,
  2,
  0,

  4,
  5,
  5,
  7,
  7,
  6,
  6,
  4,

  0,
  4,
  1,
  5,
  3,
  7,
  2,
  6,
]

const CHECKERBOARD_TEXTURE_DATA = [
  // data
  0xff,
  0xcc,
  0xff,
  0xcc,
  0xff,
  0xcc,
  0xff,
  0xcc,
  0xcc,
  0xff,
  0xcc,
  0xff,
  0xcc,
  0xff,
  0xcc,
  0xff,
  0xff,
  0xcc,
  0xff,
  0xcc,
  0xff,
  0xcc,
  0xff,
  0xcc,
  0xcc,
  0xff,
  0xcc,
  0xff,
  0xcc,
  0xff,
  0xcc,
  0xff,
  0xff,
  0xcc,
  0xff,
  0xcc,
  0xff,
  0xcc,
  0xff,
  0xcc,
  0xcc,
  0xff,
  0xcc,
  0xff,
  0xcc,
  0xff,
  0xcc,
  0xff,
  0xff,
  0xcc,
  0xff,
  0xcc,
  0xff,
  0xcc,
  0xff,
  0xcc,
  0xcc,
  0xff,
  0xcc,
  0xff,
  0xcc,
  0xff,
  0xcc,
  0xff,
]

const CHECKERED_VERTEX_SHADER = `
  uniform mat4 textureMatrix;

  attribute vec4 position;
  attribute vec2 uv;

  varying vec4 v_projectedTexcoord;
  varying vec2 v_uv;

  void main () {
    vec4 worldPosition = modelMatrix * position;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;

    v_uv = uv;
    v_projectedTexcoord = textureMatrix * worldPosition;
  }
`

const CHECKERED_FRAGMENT_SHADER = `
  uniform vec4 colorMult;
  uniform sampler2D texture;
  uniform sampler2D projectedTexture;
  
  varying vec4 v_projectedTexcoord;
  varying vec2 v_uv;

  void main () {
    // gl_FragColor = texture2D(texture, v_uv) * colorMult;

    vec3 projectedTexcoord = v_projectedTexcoord.xyz / v_projectedTexcoord.w;
    bool inRange = 
        projectedTexcoord.x >= 0.0 &&
        projectedTexcoord.x <= 1.0 &&
        projectedTexcoord.y >= 0.0 &&
        projectedTexcoord.y <= 1.0;
    
    vec4 projectedTexColor = texture2D(projectedTexture, projectedTexcoord.xy);
    vec4 texColor = texture2D(texture, v_uv) * colorMult;
  
    float projectedAmount = inRange ? 1.0 : 0.0;
    gl_FragColor = mix(texColor, projectedTexColor, projectedAmount);
  }
`

const OPTIONS = {
  posX: 3.5,
  posY: 4.4,
  posZ: 4.7,
  targetX: 0.8,
  targetY: 0,
  targetZ: 4.7,
  projectionScale: 1,
}

const stats = new Stats()
document.body.appendChild(stats.domElement)

const gui = new dat.GUI()

const dpr = devicePixelRatio
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

let oldTime = 0

let sphereMesh
let planeMesh
let cubeMesh
let projectedTexture

const textureWorldMatrix = mat4.create()
const projectionPos = vec3.create()
const projectionTarget = vec3.create()
const projectionScaleVec = vec3.create()
const cubeScaleVec = vec3.create()

const updateTexMatrix = ({
  posX = OPTIONS.posX,
  posY = OPTIONS.posY,
  posZ = OPTIONS.posZ,
  targetX = OPTIONS.targetX,
  targetY = OPTIONS.targetY,
  targetZ = OPTIONS.targetZ,
  projectionScale = OPTIONS.projectionScale,
} = {}) => {
  vec3.set(projectionPos, posX, posY, posZ)
  vec3.set(projectionTarget, targetX, targetY, targetZ)
  vec3.set(projectionScaleVec, projectionScale, 0, projectionScale)

  mat4.identity(textureWorldMatrix)
  mat4.lookAt(textureWorldMatrix, projectionPos, projectionTarget, UP_VECTOR)
  mat4.scale(textureWorldMatrix, textureWorldMatrix, projectionScaleVec)
  // mat4.invert(textureWorldMatrix, textureWorldMatrix)
  sphereMesh.setUniform('textureMatrix', 'matrix4fv', textureWorldMatrix)
  planeMesh.setUniform('textureMatrix', 'matrix4fv', textureWorldMatrix)

  vec3.set(cubeScaleVec, 1, 1, 100)
  cubeMesh
    .setCamera(camera)
    .setUniform('modelMatrix', 'matrix4fv', textureWorldMatrix)
}

gui.add(OPTIONS, 'posX').min(-20).max(20).step(1).onChange(updateTexMatrix)
gui.add(OPTIONS, 'posY').min(-20).max(20).step(1).onChange(updateTexMatrix)
gui.add(OPTIONS, 'posZ').min(-20).max(20).step(1).onChange(updateTexMatrix)
gui.add(OPTIONS, 'targetX').min(-20).max(20).step(1).onChange(updateTexMatrix)
gui.add(OPTIONS, 'targetY').min(-20).max(20).step(1).onChange(updateTexMatrix)
gui.add(OPTIONS, 'targetZ').min(-20).max(20).step(1).onChange(updateTexMatrix)
gui
  .add(OPTIONS, 'projectionScale')
  .min(0.1)
  .max(5)
  .step(0.1)
  .onChange(updateTexMatrix)

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
camera.position = [7, 7, 12]
camera.lookAt([0, 0, 0])

new hwoaRangGL.CameraController(camera, canvas)

const checkeredTexture = new hwoaRangGL.Texture(gl, {
  width: 8,
  height: 8,
  format: gl.LUMINANCE,
  image: new Uint8Array(CHECKERBOARD_TEXTURE_DATA),
  magFilter: gl.NEAREST,
  minFilter: gl.NEAREST,
})

const sharedUniforms = {
  texture: { type: 'int', value: 0 },
  projectedTexture: { type: 'int', value: 1 },
  textureMatrix: { type: 'matrix4fv', value: textureWorldMatrix },
}

/* ---- Sphere mesh ---- */
{
  const { indices, vertices, uv } = hwoaRangGL.GeometryUtils.createSphere({
    radius: 1,
    widthSegments: 12,
    heightSegments: 5,
  })
  const geometry = new hwoaRangGL.Geometry(gl)
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
  sphereMesh = new hwoaRangGL.Mesh(gl, {
    geometry,
    uniforms: {
      ...sharedUniforms,
      colorMult: { type: 'vec4', value: [1, 0, 0, 1] },
    },
    vertexShaderSource: CHECKERED_VERTEX_SHADER,
    fragmentShaderSource: CHECKERED_FRAGMENT_SHADER,
  })
}

/* ---- Plane mesh ---- */
{
  const { indices, vertices, uv } = hwoaRangGL.GeometryUtils.createPlane({
    width: 20,
    height: 20,
  })
  const geometry = new hwoaRangGL.Geometry(gl)
  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', { typedArray: vertices, size: 3 })
    .addAttribute('uv', { typedArray: uv, size: 2 })
  planeMesh = new hwoaRangGL.Mesh(gl, {
    geometry,
    uniforms: {
      ...sharedUniforms,
      colorMult: { type: 'vec4', value: [0, 0, 1, 1] },
    },
    vertexShaderSource: CHECKERED_VERTEX_SHADER,
    fragmentShaderSource: CHECKERED_FRAGMENT_SHADER,
  })
  planeMesh.setRotation({ x: 1 }, Math.PI / 2).setPosition({ y: -1.5 })
}

/* ---- Cube Mesh ---- */
{
  const vertices = new Float32Array(CUBE_VERTICES)
  const indices = new Int16Array(CUBE_INDICES)
  const geometry = new hwoaRangGL.Geometry(gl)
  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', { typedArray: vertices, size: 3 })
  cubeMesh = new hwoaRangGL.Mesh(gl, {
    geometry,
    uniforms: {
      color: { type: 'vec4', value: [0, 0, 0, 1] },
    },
    vertexShaderSource: `
      attribute vec4 position;
      void main() {
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
      }
    `,
    fragmentShaderSource: `
      uniform vec4 color;
      void main() {
        gl_FragColor = color;
      }
    `,
  })
  cubeMesh.drawMode = gl.LINES
}

const img = new Image()
img.onload = () => {
  projectedTexture = new hwoaRangGL.Texture(gl, {
    image: img,
    width: img.naturalWidth,
    height: img.naturalHeight,
    anisotropy: 8,
  })
}
img.src = '../assets/images/tekken2-cover.jpg'

updateTexMatrix()
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

  gl.activeTexture(gl.TEXTURE0)
  checkeredTexture.bind()

  if (projectedTexture) {
    gl.activeTexture(gl.TEXTURE0 + 1)
    projectedTexture.bind()
  }

  sphereMesh.setCamera(camera).draw()
  planeMesh.setCamera(camera).draw()

  cubeMesh.setCamera(camera).draw()

  stats.end()

  requestAnimationFrame(updateFrame)
}

function resize() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}
