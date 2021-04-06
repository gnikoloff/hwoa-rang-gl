import Stats from 'stats-js'
import * as dat from 'dat.gui'
import { vec3, mat4 } from 'gl-matrix'
import throttle from 'lodash.throttle'

import {
  PerspectiveCamera,
  CameraController,
  Geometry,
  GeometryUtils,
  Mesh,
} from '../../../../dist/esm'

const litObjectVertexShader = `
  struct SpotLightInfo {
    float shininess;
    vec3 lightColor;
    vec3 specularColor;
    float specularFactor;
    vec3 worldPosition;
    vec3 lightDirection;
    float innerLimit;
    float outerLimit;
  };
  
  uniform SpotLightInfo SpotLight;
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

    v_surfaceToLight = SpotLight.worldPosition - surfaceWorldPosition;
    v_surfaceToView = eyePosition - surfaceWorldPosition;
    v_uv = uv;
    v_normal = mat3(modelMatrix) * normal;
  }
`

const litObjectFragmentShader = `
  struct SpotLightInfo {
    float shininess;
    vec3 lightColor;
    vec3 specularColor;
    float specularFactor;
    vec3 worldPosition;
    vec3 lightDirection;
    float innerLimit;
    float outerLimit;
  };

  uniform SpotLightInfo SpotLight;

  varying vec2 v_uv;
  varying vec3 v_normal;
  varying vec3 v_surfaceToLight;
  varying vec3 v_surfaceToView;

  void main () {
    vec3 normal = normalize(v_normal);
    vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
    vec3 surfaceToViewDirection = normalize(v_surfaceToView);

    vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

    float dotFromDirection = dot(surfaceToLightDirection, -SpotLight.lightDirection);
    float limitRange = SpotLight.innerLimit - SpotLight.outerLimit;
    float inLight = clamp((dotFromDirection - SpotLight.outerLimit) / limitRange, 0.0, 1.0);

    float light = inLight * dot(normal, surfaceToLightDirection);
    float specular = inLight * pow(dot(normal, halfVector), SpotLight.shininess);
    
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    gl_FragColor.rgb *= light * SpotLight.lightColor;
    gl_FragColor.rgb += specular * SpotLight.specularColor * SpotLight.specularFactor;
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

const makeLightHelperVertices = (hasArrow) => {
  const vertices = [
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
  ]
  if (hasArrow) {
    vertices.push(
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
    )
  }
  return vertices
}

const gui = new dat.GUI()

const MOVEMENT_LIGHT_RADIUS = 2.25

const OPTIONS = {
  shininess: 38,
  specularFactor: 0.4,
  lightColor: [201, 0, 0],
  specularColor: [255, 0, 0],
  innerLimit: 90,
  outerLimit: 120,
  theta: 0,
  phi: 10,
  lightsDebug: true,
}

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = Math.min(devicePixelRatio, 2)
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
const spotLightMat = mat4.create()
const target = vec3.create()
vec3.set(target, 0, 0, 0)
const up = vec3.create()
vec3.set(up, 0, 1, 0)

let lightDirection
let boxMesh
let sphereMesh
let floorHelperMesh
// let lightHelperMesh
let lightPointerHelperMeshInner
let lightPointerHelperMeshOuter
let oldTime = 0

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
gl.enable(gl.DEPTH_TEST)
// gl.enable(gl.CULL_FACE)
gl.depthFunc(gl.LEQUAL)

const camera = new PerspectiveCamera(
  (45 * Math.PI) / 180,
  innerWidth / innerHeight,
  0.1,
  100,
)
camera.position = [4, 3, 6]
camera.lookAt([0, 0, 0])

new CameraController(camera, canvas)

const lightWorldPosition = vec3.create()
vec3.set(lightWorldPosition, 0, 0, MOVEMENT_LIGHT_RADIUS)

const litObjectSharedUniforms = {
  eyePosition: { type: 'vec3', value: camera.position },
  'SpotLight.worldPosition': { type: 'vec3', value: lightWorldPosition },
  'SpotLight.shininess': { type: 'float', value: OPTIONS.shininess },
  'SpotLight.lightColor': {
    type: 'vec3',
    value: normalizeColor(OPTIONS.lightColor),
  },
  'SpotLight.specularColor': {
    type: 'vec3',
    value: normalizeColor(OPTIONS.specularColor),
  },
  'SpotLight.specularFactor': {
    type: 'float',
    value: OPTIONS.specularFactor,
  },
  'SpotLight.lightDirection': {
    type: 'vec3',
    value: [0, 0, 0],
  },
  'SpotLight.innerLimit': {
    type: 'float',
    value: Math.cos((OPTIONS.innerLimit * Math.PI) / 180),
  },
  'SpotLight.outerLimit': {
    type: 'float',
    value: Math.cos((OPTIONS.outerLimit * Math.PI) / 180),
  },
}

{
  const { indices, vertices, uv, normal } = GeometryUtils.createBox()
  const geometry = new Geometry(gl)

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

  boxMesh = new Mesh(gl, {
    geometry,
    uniforms: {
      ...litObjectSharedUniforms,
    },
    vertexShaderSource: litObjectVertexShader,
    fragmentShaderSource: litObjectFragmentShader,
  })
  boxMesh.setPosition({
    x: -0.65,
    y: 0.5,
  })
}

{
  const { indices, vertices, normal } = GeometryUtils.createSphere({
    widthSegments: 20,
    heightSegments: 20,
  })
  const geometry = new Geometry(gl)
  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', { typedArray: vertices, size: 3 })
    .addAttribute('normal', { typedArray: normal, size: 3 })

  sphereMesh = new Mesh(gl, {
    geometry,
    uniforms: {
      ...litObjectSharedUniforms,
    },
    vertexShaderSource: litObjectVertexShader,
    fragmentShaderSource: litObjectFragmentShader,
  })
  sphereMesh.setPosition({
    x: 0.65,
    y: 0.5,
  })
}

{
  const { indices, vertices } = GeometryUtils.createSphere({
    radius: 0.1,
  })
  const geometry = new Geometry(gl)
  geometry.addIndex({ typedArray: indices }).addAttribute('position', {
    typedArray: vertices,
    size: 3,
  })
  // lightHelperMesh = new Mesh(gl, {
  //   geometry,
  //   uniforms: {
  //     color: { type: 'vec3', value: [1, 1, 1] },
  //   },
  //   vertexShaderSource: helperVertexShader,
  //   fragmentShaderSource: helperFragmentShader,
  // })
  // lightHelperMesh.setPosition({
  //   x: lightWorldPosition[0],
  //   y: lightWorldPosition[1] + 0.39,
  //   z: lightWorldPosition[2] + MOVEMENT_LIGHT_RADIUS,
  // })
}

{
  const vertices = new Float32Array(makeLightHelperVertices(true))
  const geometry = new Geometry(gl)
  geometry.addAttribute('position', {
    typedArray: vertices,
    size: 3,
  })
  lightPointerHelperMeshInner = new Mesh(gl, {
    geometry,
    uniforms: {
      color: { type: 'vec3', value: [0, 1, 0] },
    },
    vertexShaderSource: helperVertexShader,
    fragmentShaderSource: helperFragmentShader,
  })
  lightPointerHelperMeshInner.drawMode = gl.LINES
  lightPointerHelperMeshInner
    .setPosition({
      y: 0.39,
      z: MOVEMENT_LIGHT_RADIUS,
    })

    .setScale({
      x: OPTIONS.innerLimit / 180,
      y: OPTIONS.innerLimit / 180,
    })
}

{
  const vertices = new Float32Array(makeLightHelperVertices(false))
  const geometry = new Geometry(gl)
  geometry.addAttribute('position', {
    typedArray: vertices,
    size: 3,
  })
  lightPointerHelperMeshOuter = new Mesh(gl, {
    geometry,
    uniforms: {
      color: { type: 'vec3', value: [0, 0, 1] },
    },
    vertexShaderSource: helperVertexShader,
    fragmentShaderSource: helperFragmentShader,
  })
  lightPointerHelperMeshOuter.drawMode = gl.LINES
  lightPointerHelperMeshOuter
    .setPosition({
      y: 0.39,
      z: MOVEMENT_LIGHT_RADIUS,
    })
    .setScale({
      x: OPTIONS.outerLimit / 180,
      y: OPTIONS.outerLimit / 180,
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

  const geometry = new Geometry(gl)
  geometry.addAttribute('position', {
    typedArray: vertices,
    size: 3,
  })
  floorHelperMesh = new Mesh(gl, {
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
  .add(OPTIONS, 'shininess')
  .min(1)
  .max(100)
  .step(1)
  .onChange((val) => {
    boxMesh.use().setUniform('SpotLight.shininess', 'float', val)
    sphereMesh.use().setUniform('SpotLight.shininess', 'float', val)
  })
gui
  .add(OPTIONS, 'theta')
  .min(0)
  .max(360)
  .step(5)
  .onChange((val) => {
    const cameraUpdateX =
      Math.sin((val * Math.PI) / 180) * MOVEMENT_LIGHT_RADIUS * 2
    const cameraUpdateZ =
      Math.cos((val * Math.PI) / 180) * MOVEMENT_LIGHT_RADIUS * 2
    const cameraPointerUpdateX =
      Math.sin((val * Math.PI) / 180) * MOVEMENT_LIGHT_RADIUS
    const cameraPointerUpdateZ =
      Math.cos((val * Math.PI) / 180) * MOVEMENT_LIGHT_RADIUS
    // lightHelperMesh.setPosition({
    //   x: cameraUpdateX,
    //   z: cameraUpdateZ,
    // })
    lightPointerHelperMeshInner
      .setRotation({ x: 0, y: 1 }, (val * Math.PI) / 180)
      .setPosition({
        x: cameraPointerUpdateX,
        z: cameraPointerUpdateZ,
      })
    lightPointerHelperMeshOuter
      .setRotation({ x: 0, y: 1 }, (val * Math.PI) / 180)
      .setPosition({
        x: cameraPointerUpdateX,
        z: cameraPointerUpdateZ,
      })
    vec3.set(
      lightWorldPosition,
      cameraPointerUpdateX,
      lightWorldPosition[1],
      cameraPointerUpdateZ,
    )
    boxMesh
      .use()
      .setUniform('SpotLight.worldPosition', 'vec3', lightWorldPosition)
    sphereMesh
      .use()
      .setUniform('SpotLight.worldPosition', 'vec3', lightWorldPosition)
  })

gui
  .add(OPTIONS, 'phi')
  .min(0)
  .max(360)
  .step(5)
  .onChange((val) => {
    const cameraUpdateY =
      Math.sin((val * Math.PI) / 180) * MOVEMENT_LIGHT_RADIUS
    const cameraUpdateZ =
      Math.cos((val * Math.PI) / 180) * MOVEMENT_LIGHT_RADIUS
    const cameraPointerUpdateY =
      Math.sin((val * Math.PI) / 180) * MOVEMENT_LIGHT_RADIUS
    const cameraPointerUpdateZ =
      Math.cos((val * Math.PI) / 180) * MOVEMENT_LIGHT_RADIUS
    // lightHelperMesh.setPosition({
    //   y: Math.sin((val * Math.PI) / 180) * MOVEMENT_LIGHT_RADIUS * 2,
    //   z: Math.cos((val * Math.PI) / 180) * MOVEMENT_LIGHT_RADIUS * 2,
    // })
    lightPointerHelperMeshInner
      .setRotation({ x: 1, y: 0 }, -(val * Math.PI) / 180)
      .setPosition({
        y: cameraUpdateY,
        z: cameraUpdateZ,
      })
    lightPointerHelperMeshOuter
      .setRotation({ x: 1, y: 0 }, -(val * Math.PI) / 180)
      .setPosition({
        y: cameraPointerUpdateY,
        z: cameraPointerUpdateZ,
      })
    vec3.set(
      lightWorldPosition,
      lightWorldPosition[0],
      cameraPointerUpdateY,
      cameraPointerUpdateZ,
    )
    boxMesh
      .use()
      .setUniform('SpotLight.worldPosition', 'vec3', lightWorldPosition)
    sphereMesh
      .use()
      .setUniform('SpotLight.worldPosition', 'vec3', lightWorldPosition)
  })
gui
  .add(OPTIONS, 'specularFactor')
  .min(0)
  .max(1)
  .step(0.05)
  .onChange((val) => {
    boxMesh.use().setUniform('SpotLight.specularFactor', 'float', val)
    sphereMesh.use().setUniform('SpotLight.specularFactor', 'float', val)
  })
gui
  .add(OPTIONS, 'innerLimit')
  .min(0)
  .max(180)
  .step(1)
  .onChange((val) => {
    if (val > OPTIONS.outerLimit) {
      OPTIONS.outerLimit = val + 1
    }
    lightPointerHelperMeshInner.setScale({ x: val / 180, y: val / 180 })
    val *= Math.PI / 180
    boxMesh.use().setUniform('SpotLight.innerLimit', 'float', Math.cos(val))
    sphereMesh.use().setUniform('SpotLight.innerLimit', 'float', Math.cos(val))
  })
  .listen()
gui
  .add(OPTIONS, 'outerLimit')
  .min(0)
  .max(180)
  .step(1)
  .onChange((val) => {
    if (val < OPTIONS.innerLimit) {
      OPTIONS.innerLimit = val - 1
    }
    lightPointerHelperMeshOuter.setScale({ x: val / 180, y: val / 180 })
    val *= Math.PI / 180
    boxMesh.use().setUniform('SpotLight.outerLimit', 'float', Math.cos(val))
    sphereMesh.use().setUniform('SpotLight.outerLimit', 'float', Math.cos(val))
  })
  .listen()

gui.addColor(OPTIONS, 'lightColor').onChange((newColor) => {
  boxMesh
    .use()
    .setUniform('SpotLight.lightColor', 'vec3', normalizeColor(newColor))
  sphereMesh
    .use()
    .setUniform('SpotLight.lightColor', 'vec3', normalizeColor(newColor))
})
gui.addColor(OPTIONS, 'specularColor').onChange((newColor) => {
  sphereMesh
    .use()
    .setUniform('SpotLight.specularColor', 'vec3', normalizeColor(newColor))
  boxMesh
    .use()
    .setUniform('SpotLight.specularColor', 'vec3', normalizeColor(newColor))
})

gui.add(OPTIONS, 'lightsDebug')

const position = vec3.create()
vec3.set(position, ...lightPointerHelperMeshOuter.position)
mat4.lookAt(spotLightMat, position, target, up)
lightDirection = [-spotLightMat[8], -spotLightMat[9], -spotLightMat[10]]

document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
sizeCanvas()
window.addEventListener('resize', throttle(resize, 100))

function updateFrame(ts) {
  ts /= 1000
  const dt = ts - oldTime
  oldTime = ts

  stats.begin()

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.1, 0.1, 0.1, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  boxMesh
    .use()
    .setUniform('eyePosition', 'vec3', camera.position)
    // .setUniform('SpotLight.lightDirection', 'vec3', lightDirection)
    .setCamera(camera)
    .setRotation(
      {
        y: 1,
      },
      ts * 0.5,
    )
    .draw()

  sphereMesh
    .use()
    .setUniform('eyePosition', 'vec3', camera.position)
    // .setUniform('SpotLight.lightDirection', 'vec3', lightDirection)
    .setCamera(camera)
    .draw()

  floorHelperMesh.use().setCamera(camera).draw()

  if (OPTIONS.lightsDebug) {
    // lightHelperMesh.setCamera(camera).draw()

    lightPointerHelperMeshInner.use().setCamera(camera).draw()
    lightPointerHelperMeshOuter.use().setCamera(camera).draw()
  }

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

function normalizeColor(color) {
  return [color[0] / 255, color[1] / 255, color[2] / 255]
}
