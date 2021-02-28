const litObjectVertexShader = `
  struct PointLightInfo {
    float shininess;
    vec3 lightColor;
    vec3 specularColor;
    float specularFactor;
    vec3 worldPosition;
  };
  
  uniform PointLightInfo PointLight;
  uniform vec3 eyePosition;

  attribute vec4 position;
  attribute vec2 uv;
  attribute vec3 normal;

  varying vec2 v_uv;
  varying vec3 v_normal;
  varying vec3 v_surfaceToLight;
  varying vec3 v_surfaceToView;

  void main () {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;

    vec3 surfaceWorldPosition = (modelMatrix * position).xyz;

    v_surfaceToLight = PointLight.worldPosition - surfaceWorldPosition;
    v_surfaceToView = eyePosition - surfaceWorldPosition;
    v_uv = uv;
    v_normal = mat3(modelMatrix) * normal;
  }
`

const litObjectFragmentShader = `
  struct PointLightInfo {
    float shininess;
    vec3 lightColor;
    vec3 specularColor;
    float specularFactor;
    vec3 worldPosition;
  };

  uniform PointLightInfo PointLight;

  varying vec2 v_uv;
  varying vec3 v_normal;
  varying vec3 v_surfaceToLight;
  varying vec3 v_surfaceToView;

  void main () {
    vec3 normal = normalize(v_normal);
    vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
    vec3 surfaceToViewDirection = normalize(v_surfaceToView);

    vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);
    float pointLight = dot(normal, surfaceToLightDirection);
    float specular = 0.0;

    if (pointLight > 0.0) {
      specular = pow(dot(normal, halfVector), PointLight.shininess);
    }
    
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    gl_FragColor.rgb *= pointLight * PointLight.lightColor;
    gl_FragColor.rgb += specular * PointLight.specularColor * PointLight.specularFactor;
  }
`

const helperVertexShader = `
  attribute vec4 position;
  void main () {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
  }
`

const helperFragmentShader = `
  uniform vec3 color;
  void main () {
    gl_FragColor = vec4(color, 1.0);
  }
`

const gui = new dat.GUI()

const MOVEMENT_LIGHT_RADIUS = 2.25

const OPTIONS = {
  shininess: 38,
  specularFactor: 0.4,
  lightColor: [201, 0, 0],
  specularColor: [255, 0, 0],
  theta: 0,
  phi: 10,
  lightsDebug: true,
}

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = devicePixelRatio
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

let boxMesh
let sphereMesh
let floorHelperMesh
let lightHelperMesh
let lightPointerHelperMesh
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
camera.position = [4, 3, 6]
camera.lookAt([0, 0, 0])

new hwoaRangGL.CameraController(camera, canvas)

const lightWorldPosition = vec3.create()
vec3.set(lightWorldPosition, 0, 0, MOVEMENT_LIGHT_RADIUS)

const litObjectSharedUniforms = {
  eyePosition: { type: 'vec3', value: camera.position },
  'PointLight.worldPosition': { type: 'vec3', value: lightWorldPosition },
  'PointLight.shininess': { type: 'float', value: OPTIONS.shininess },
  'PointLight.lightColor': {
    type: 'vec3',
    value: normalizeColor(OPTIONS.lightColor),
  },
  'PointLight.specularColor': {
    type: 'vec3',
    value: normalizeColor(OPTIONS.specularColor),
  },
  'PointLight.specularFactor': {
    type: 'float',
    value: OPTIONS.specularFactor,
  },
}

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
      ...litObjectSharedUniforms,
    },
    vertexShaderSource: litObjectVertexShader,
    fragmentShaderSource: litObjectFragmentShader,
  })
  boxMesh.setPosition({
    x: -0.75,
    y: 0.5,
  })
}

{
  const { indices, vertices, normal } = hwoaRangGL.GeometryUtils.createSphere({
    widthSegments: 20,
    heightSegments: 20,
  })
  const geometry = new hwoaRangGL.Geometry(gl)
  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', { typedArray: vertices, size: 3 })
    .addAttribute('normal', { typedArray: normal, size: 3 })

  sphereMesh = new hwoaRangGL.Mesh(gl, {
    geometry,
    uniforms: {
      ...litObjectSharedUniforms,
    },
    vertexShaderSource: litObjectVertexShader,
    fragmentShaderSource: litObjectFragmentShader,
  })
  sphereMesh.setPosition({
    x: 0.75,
    y: 0.5,
  })
}

{
  const { indices, vertices } = hwoaRangGL.GeometryUtils.createSphere({
    radius: 0.1,
  })
  const geometry = new hwoaRangGL.Geometry(gl)
  geometry.addIndex({ typedArray: indices }).addAttribute('position', {
    typedArray: vertices,
    size: 3,
  })
  lightHelperMesh = new hwoaRangGL.Mesh(gl, {
    geometry,
    uniforms: {
      color: { type: 'vec3', value: [1, 1, 1] },
    },
    vertexShaderSource: helperVertexShader,
    fragmentShaderSource: helperFragmentShader,
  })
  lightHelperMesh.setPosition({
    x: lightWorldPosition[0],
    y: lightWorldPosition[1] + 0.39,
    z: lightWorldPosition[2],
  })
}

{
  const vertices = new Float32Array([
    0,
    0,
    MOVEMENT_LIGHT_RADIUS,
    1,
    1,
    0,

    1,
    1,
    0,
    -1,
    1,
    0,

    -1,
    1,
    0,
    0,
    0,
    MOVEMENT_LIGHT_RADIUS,

    0,
    0,
    MOVEMENT_LIGHT_RADIUS,
    -1,
    -1,
    0,
    -1,
    -1,
    0,
    -1,
    1,
    0,

    0,
    0,
    MOVEMENT_LIGHT_RADIUS,
    1,
    -1,
    0,

    1,
    -1,
    0,
    1,
    1,
    0,

    1,
    -1,
    0,
    -1,
    -1,
    0,

    0,
    0,
    MOVEMENT_LIGHT_RADIUS,
    0,
    0,
    MOVEMENT_LIGHT_RADIUS * 0.75,
    0,
    0,
    MOVEMENT_LIGHT_RADIUS * 0.75,
    0.05,
    0,
    MOVEMENT_LIGHT_RADIUS * 0.77,
    0,
    0,
    MOVEMENT_LIGHT_RADIUS * 0.75,
    -0.05,
    0,
    MOVEMENT_LIGHT_RADIUS * 0.77,
    0,
    0,
  ])
  const geometry = new hwoaRangGL.Geometry(gl)
  geometry.addAttribute('position', {
    typedArray: vertices,
    size: 3,
  })
  lightPointerHelperMesh = new hwoaRangGL.Mesh(gl, {
    geometry,
    uniforms: {
      color: { type: 'vec3', value: [0, 1, 0] },
    },
    vertexShaderSource: helperVertexShader,
    fragmentShaderSource: helperFragmentShader,
  })
  lightPointerHelperMesh.drawMode = gl.LINES
  lightPointerHelperMesh.setPosition({
    y: 0.39,
  })
}

// Floor helper
{
  const FLOOR_HELPER_LINES_COUNT = 20
  const FLOOR_HELPER_RADIUS = 5
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
    uniforms: {
      color: { type: 'vec3', value: [0.5, 0.5, 0.5] },
    },
    vertexShaderSource: helperVertexShader,
    fragmentShaderSource: helperFragmentShader,
  })
  floorHelperMesh.drawMode = gl.LINES
  floorHelperMesh.setRotation(
    {
      x: 1,
    },
    Math.PI / 2,
  )
}

gui
  .add(OPTIONS, 'theta')
  .min(0)
  .max(360)
  .step(5)
  .onChange((val) => {
    const updatex = Math.sin((val * Math.PI) / 180) * MOVEMENT_LIGHT_RADIUS
    const updatez = Math.cos((val * Math.PI) / 180) * MOVEMENT_LIGHT_RADIUS
    lightHelperMesh.setPosition({
      x: updatex,
      z: updatez,
    })
    lightPointerHelperMesh.setPosition({
      x: updatex,
      z: updatez - MOVEMENT_LIGHT_RADIUS,
    })
    vec3.set(lightWorldPosition, updatex, lightWorldPosition[1], updatez)
    boxMesh.setUniform('PointLight.worldPosition', 'vec3', lightWorldPosition)
    sphereMesh.setUniform(
      'PointLight.worldPosition',
      'vec3',
      lightWorldPosition,
    )
  })

gui
  .add(OPTIONS, 'phi')
  .min(0)
  .max(360)
  .step(5)
  .onChange((val) => {
    const updatey = Math.sin((val * Math.PI) / 180) * MOVEMENT_LIGHT_RADIUS
    const updatez = Math.cos((val * Math.PI) / 180) * MOVEMENT_LIGHT_RADIUS
    lightHelperMesh.setPosition({ y: updatey, z: updatez })
    lightPointerHelperMesh.setPosition({
      y: updatey,
      z: updatez - MOVEMENT_LIGHT_RADIUS,
    })
    vec3.set(lightWorldPosition, lightWorldPosition[0], updatey, updatez)
    boxMesh.setUniform('PointLight.worldPosition', 'vec3', lightWorldPosition)
    sphereMesh.setUniform(
      'PointLight.worldPosition',
      'vec3',
      lightWorldPosition,
    )
  })

gui.add(OPTIONS, 'lightsDebug')

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

  boxMesh.setUniform('eyePosition', 'vec3', camera.position)
  boxMesh.setCamera(camera)
  boxMesh.setRotation(
    {
      y: 1,
    },
    ts * 0.5,
  )
  boxMesh.draw()

  sphereMesh.setUniform('eyePosition', 'vec3', camera.position)
  sphereMesh.setCamera(camera)
  sphereMesh.draw()

  floorHelperMesh.setCamera(camera)
  floorHelperMesh.draw()

  if (OPTIONS.lightsDebug) {
    lightHelperMesh.setCamera(camera)
    lightHelperMesh.draw()

    lightPointerHelperMesh.setCamera(camera)
    lightPointerHelperMesh.draw()
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

function normalizeColor(color) {
  return [color[0] / 255, color[1] / 255, color[2] / 255]
}
