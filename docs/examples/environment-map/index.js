const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = devicePixelRatio
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

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
camera.position = [0, 0, 10]
camera.lookAt([0, 0, 0])

new hwoaRangGL.CameraController(camera)

const facesInfo = [
  {
    target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    src: '../assets/images/cubemap/posx.jpg',
  },
  {
    target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    src: '../assets/images/cubemap/negx.jpg',
  },
  {
    target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    src: '../assets/images/cubemap/negy.jpg',
  },
  {
    target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
    src: '../assets/images/cubemap/posy.jpg',
  },
  {
    target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
    src: '../assets/images/cubemap/negz.jpg',
  },
  {
    target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
    src: '../assets/images/cubemap/posz.jpg',
  },
]

var texture = gl.createTexture()
gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)

facesInfo.forEach(({ target, src }) => {
  const level = 0
  const internalFormat = gl.RGBA
  const format = internalFormat
  const type = gl.UNSIGNED_BYTE
  // setup each face so it's immediately renderable
  gl.texImage2D(
    target,
    level,
    internalFormat,
    1024,
    1024,
    0,
    format,
    type,
    null,
  )
  const img = new Image()
  img.onload = () => {
    // Now that the image has loaded upload it to the texture.
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)
    gl.texImage2D(target, level, internalFormat, format, type, img)
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP)
  }
  img.src = src
})
gl.generateMipmap(gl.TEXTURE_CUBE_MAP)
gl.texParameteri(
  gl.TEXTURE_CUBE_MAP,
  gl.TEXTURE_MIN_FILTER,
  gl.LINEAR_MIPMAP_LINEAR,
)

const { indices, vertices, normal } = hwoaRangGL.GeometryUtils.createBox()
const boxGeometry = new hwoaRangGL.Geometry(gl)
boxGeometry
  .addIndex({ typedArray: indices })
  .addAttribute('position', {
    typedArray: vertices,
    size: 3,
  })
  .addAttribute('normal', {
    typedArray: normal,
    size: 3,
  })

const boxMesh = new hwoaRangGL.Mesh(gl, {
  geometry: boxGeometry,
  uniforms: {
    texture: { type: 'int', value: 0 },
    worldCameraPosition: { type: 'vec3', value: camera.position },
  },
  vertexShaderSource: `
    attribute vec4 position;
    attribute vec3 normal;

    varying vec3 v_worldPosition;
    varying vec3 v_worldNormal;

    void main () {
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;

      v_worldPosition = (modelMatrix * position).xyz;
      v_worldNormal = mat3(modelMatrix) * normal;
    }
  `,
  fragmentShaderSource: `
    uniform vec3 worldCameraPosition;
    uniform samplerCube texture;

    varying vec3 v_worldPosition;
    varying vec3 v_worldNormal;

    varying vec3 v_normal;
    void main () {
      vec3 worldNormal = normalize(v_worldNormal);
      vec3 eyeToSurfaceDir = normalize(v_worldPosition - worldCameraPosition);
      vec3 direction = reflect(eyeToSurfaceDir, worldNormal);
    
      gl_FragColor = textureCube(texture, direction);
    }
  `,
})

boxMesh.setScale({ x: 20, y: 20, z: 20 })

const {
  vertices: quadVertices,
} = hwoaRangGL.GeometryUtils.createFullscreenQuad()
const quadGeometry = new hwoaRangGL.Geometry(gl)
quadGeometry.addAttribute('position', {
  typedArray: quadVertices,
  size: 2,
})

const quadMesh = new hwoaRangGL.Mesh(gl, {
  geometry: quadGeometry,
  uniforms: {
    skybox: { type: 'int', value: 0 },
    viewDirectionProjectionInverse: { type: 'mat4', value: null },
  },
  vertexShaderSource: `
    attribute vec4 position;

    varying vec4 v_position;

    void main () {
      gl_Position = position;
      v_position = position;
      gl_Position.z = 1.0;
    }
  `,
  fragmentShaderSource: `
    uniform samplerCube skybox;
    uniform mat4 viewDirectionProjectionInverse;
  
    varying vec4 v_position;
    void main () {
      vec4 t = viewDirectionProjectionInverse * v_position;
      gl_FragColor = textureCube(skybox, normalize(t.xyz / t.w));
    }
  `,
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

  quadMesh
    .setUniform(
      'viewDirectionProjectionInverse',
      'mat4',
      camera.getViewDirectionProjectionInverseMatrix(),
    )
    .draw()

  boxMesh
    .setUniform('worldCameraPosition', 'vec3', camera.position)
    // .setRotation({ y: 1 }, ts)
    .setCamera(camera)
    .draw()

  stats.end()

  requestAnimationFrame(updateFrame)
}

function resize() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}
