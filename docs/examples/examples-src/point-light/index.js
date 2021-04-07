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
  InstancedMesh,
  UNIFORM_TYPE_FLOAT,
  UNIFORM_TYPE_VEC3,
} from '../../../../dist/esm'

const VERTEX_SHADER_SPHERES = `
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
  attribute vec3 normal;
  attribute mat4 instanceModelMatrix;

  varying vec3 v_normal;

  varying vec3 v_surfaceToLight;
  varying vec3 v_surfaceToView;

  void main () {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceModelMatrix * position;
    v_normal = mat3(modelMatrix * instanceModelMatrix) * normal;

    vec3 surfaceWorldPosition = (modelMatrix * instanceModelMatrix * position).xyz;
    v_surfaceToLight = PointLight.worldPosition - surfaceWorldPosition;
    v_surfaceToView = eyePosition - surfaceWorldPosition;
  }
`

const FRAGMENT_SHADER_SPHERES = `
  struct PointLightInfo {
    float shininess;
    vec3 lightColor;
    vec3 specularColor;
    float specularFactor;
    vec3 worldPosition;
  };

  uniform PointLightInfo PointLight;

  uniform vec3 lightDirection;

  varying vec3 v_normal;
  varying vec3 v_surfaceToLight;
  varying vec3 v_surfaceToView;

  void main () {
    vec3 normal = normalize(v_normal);
    vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
    vec3 surfaceToViewDirection = normalize(v_surfaceToView);

    vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);
    float pointLight = dot(normal, surfaceToLightDirection);
    float directionalLight = dot(normal, lightDirection);
    float specular = 0.0;

    if (pointLight > 0.0) {
      specular = pow(dot(normal, halfVector), PointLight.shininess);
    }
    
    gl_FragColor = vec4(1.0);
    gl_FragColor.rgb *= pointLight * PointLight.lightColor + directionalLight * 0.05;
    gl_FragColor.rgb += specular * PointLight.specularColor * PointLight.specularFactor;
  }
`

const VERTEX_SHADER_LIGHT_HELPER = `
  attribute vec4 position;

  void main () {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
  }
`

const FRAGMENT_SHADER_LIGHT_HELPER = `
  void main () {
    gl_FragColor = vec4(1.0);
  }
`

const BALLS_COUNT_SIZE = 8
const NUM_BALLS = BALLS_COUNT_SIZE * BALLS_COUNT_SIZE * BALLS_COUNT_SIZE

const stats = new Stats()
document.body.appendChild(stats.domElement)

const gui = new dat.GUI()

const OPTIONS = {
  shininess: 38,
  specularFactor: 0.4,
  lightColor: [201, 0, 0],
  specularColor: [255, 0, 0],
}

const dpr = Math.min(devicePixelRatio, 2)
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

const instanceMatrix = mat4.create()
const translateVector = vec3.create()

let sphereMesh
let lightMesh

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
camera.position = [0, 0, 20]
camera.lookAt([0, 0, 0])

new CameraController(camera, canvas)

const lightWorldPosition = vec3.create()
vec3.set(lightWorldPosition, 0, 0, 0)

const lightDirection = vec3.create()
vec3.set(lightDirection, 0, 5, 5)
vec3.normalize(lightDirection, lightDirection)

{
  const { indices, vertices, normal } = GeometryUtils.createSphere({
    widthSegments: 20,
    heightSegments: 20,
  })
  const geometry = new Geometry(gl)

  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', {
      typedArray: vertices,
      size: 3,
    })
    .addAttribute('normal', {
      typedArray: normal,
      size: 3,
    })

  sphereMesh = new InstancedMesh(gl, {
    geometry,
    instanceCount: NUM_BALLS,
    uniforms: {
      eyePosition: { type: UNIFORM_TYPE_VEC3, value: camera.position },
      lightDirection: { type: UNIFORM_TYPE_VEC3, value: lightDirection },
      'PointLight.worldPosition': {
        type: UNIFORM_TYPE_VEC3,
        value: lightWorldPosition,
      },
      'PointLight.shininess': {
        type: UNIFORM_TYPE_FLOAT,
        value: OPTIONS.shininess,
      },
      'PointLight.lightColor': {
        type: UNIFORM_TYPE_VEC3,
        value: normalizeColor(OPTIONS.lightColor),
      },
      'PointLight.specularColor': {
        type: UNIFORM_TYPE_VEC3,
        value: normalizeColor(OPTIONS.specularColor),
      },
      'PointLight.specularFactor': {
        type: UNIFORM_TYPE_FLOAT,
        value: OPTIONS.specularFactor,
      },
    },
    vertexShaderSource: VERTEX_SHADER_SPHERES,
    fragmentShaderSource: FRAGMENT_SHADER_SPHERES,
  })

  let idx = 0
  const scale = 1.5
  for (let i = 0; i < BALLS_COUNT_SIZE; i++) {
    for (let n = 0; n < BALLS_COUNT_SIZE; n++) {
      for (let j = 0; j < BALLS_COUNT_SIZE; j++) {
        const x = (i - BALLS_COUNT_SIZE / 2 + 0.5) * scale
        const y = (n - BALLS_COUNT_SIZE / 2 + 0.5) * scale
        const z = (j - BALLS_COUNT_SIZE / 2 + 0.5) * scale
        mat4.identity(instanceMatrix)
        vec3.set(translateVector, x, y, z)
        mat4.translate(instanceMatrix, instanceMatrix, translateVector)
        sphereMesh.setMatrixAt(idx, instanceMatrix)
        idx++
      }
    }
  }
}

{
  const { vertices, indices } = GeometryUtils.createSphere({
    radius: 0.1,
  })
  const geometry = new Geometry(gl)
  geometry.addIndex({ typedArray: indices }).addAttribute('position', {
    typedArray: vertices,
    size: 3,
  })
  lightMesh = new Mesh(gl, {
    geometry,
    vertexShaderSource: VERTEX_SHADER_LIGHT_HELPER,
    fragmentShaderSource: FRAGMENT_SHADER_LIGHT_HELPER,
  })
}

gui
  .add(OPTIONS, 'shininess')
  .min(2)
  .max(256)
  .step(1)
  .onChange((val) => {
    sphereMesh.setUniform('PointLight.shininess', UNIFORM_TYPE_FLOAT, val)
  })
gui
  .add(OPTIONS, 'specularFactor')
  .min(0)
  .max(1)
  .step(0.05)
  .onChange((val) => {
    sphereMesh.setUniform('PointLight.specularFactor', UNIFORM_TYPE_FLOAT, val)
  })
gui.addColor(OPTIONS, 'lightColor').onChange((newColor) => {
  sphereMesh.setUniform(
    'PointLight.lightColor',
    UNIFORM_TYPE_VEC3,
    normalizeColor(newColor),
  )
})
gui.addColor(OPTIONS, 'specularColor').onChange((newColor) => {
  sphereMesh.setUniform(
    'PointLight.specularColor',
    UNIFORM_TYPE_VEC3,
    normalizeColor(newColor),
  )
})

document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
sizeCanvas()
window.addEventListener('resize', throttle(resize, 100))

function normalizeColor(color) {
  return [color[0] / 255, color[1] / 255, color[2] / 255]
}

function updateFrame(ts) {
  ts /= 1000

  stats.begin()

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.05, 0.05, 0.05, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  vec3.set(lightWorldPosition, 0, 0, Math.sin(ts * 0.8) * 8)

  lightMesh
    .use()
    .setPosition({
      x: lightWorldPosition[0],
      y: lightWorldPosition[1],
      z: lightWorldPosition[2],
    })
    .setCamera(camera)
    .draw()

  sphereMesh
    .use()
    .setUniform(
      'PointLight.worldPosition',
      UNIFORM_TYPE_VEC3,
      lightWorldPosition,
    )
    .setUniform('eyePosition', UNIFORM_TYPE_VEC3, camera.position)
    .setCamera(camera)
    .draw()

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
