import Stats from 'stats-js'
import * as dat from 'dat.gui'
import { vec3, mat4 } from 'gl-matrix'

import {
  PerspectiveCamera,
  CameraController,
  Geometry,
  InstancedMesh,
} from '../../../../dist/esm'

import GLTF from './GLTFLoader'

const INSTANCE_COUNT_X = 4
const INSTANCE_COUNT_Y = 4
const INSTANCE_COUNT_Z = 8
const INSTANCE_COUNT = INSTANCE_COUNT_X * INSTANCE_COUNT_Y * INSTANCE_COUNT_Z
const FOG_COLOR = [0.9, 0.9, 0.9, 1]

const vertexShaderSource = `
  uniform float time;

  attribute vec4 position;
  attribute vec3 normal;
  attribute mat4 instanceModelMatrix;
  attribute vec3 color;

  varying vec3 v_normal;
  varying vec3 v_color;
  varying float v_fogDepth;
  varying vec3 v_position;

  void main () {
    vec4 offsetPosition = instanceModelMatrix * position;
    offsetPosition.y += sin(instanceModelMatrix[3][2] * 10.0 + time) * 1.0;

    vec4 worldViewPosition = viewMatrix * modelMatrix * offsetPosition;

    gl_Position = projectionMatrix * worldViewPosition;

    v_normal = mat3(modelMatrix) * normal;
    v_color = color;
    v_fogDepth = -(worldViewPosition).z;
    v_position = worldViewPosition.xyz;
  }
`
const getFragmentShaderSource = (isLinearFog = true) => `
  uniform vec3 lightDirection;
  uniform vec4 fogColor;
  uniform float fogNear;
  uniform float fogFar;
  uniform float fogDensity;

  varying vec3 v_normal;
  varying vec3 v_color;
  varying float v_fogDepth;
  varying vec3 v_position;

  void main () {
    vec3 normal = normalize(v_normal);
    float light = dot(normal, lightDirection);

    ${
      isLinearFog
        ? `
        float fogAmount = smoothstep(fogNear, fogFar, v_fogDepth);
      `
        : `
        #define LOG2 1.442695
        float fogDistance = length(v_position);
        float fogAmount = 1.0 - exp2(-fogDensity * fogDensity * fogDistance * fogDistance * LOG2);
        fogAmount = clamp(fogAmount, 0.0, 1.0);
      `
    }

    gl_FragColor = vec4(v_color, 1.0);
    gl_FragColor.rgb *= light;
    gl_FragColor = mix(gl_FragColor, fogColor, fogAmount);
  }
`

const OPTIONS = {
  isExponentialFog: false,
  fogNear: 0,
  fogFar: 70,
  fogDensity: 0.032,
}

const gui = new dat.GUI()

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = devicePixelRatio
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

const transformMatrix = mat4.create()
const translateVec3 = vec3.create()

const gltfInfo = document.getElementById('gltf-info')

let oldTime = 0
let gJson
let gBin
let gltfMesh
let gltfMesh2

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
gl.enable(gl.DEPTH_TEST)
gl.enable(gl.CULL_FACE)
gl.depthFunc(gl.LEQUAL)
gl.enable(gl.SCISSOR_TEST)

const camera = new PerspectiveCamera(
  (45 * Math.PI) / 180,
  innerWidth / innerHeight,
  0.1,
  100,
)
camera.position = [0, 0, 10]
camera.lookAt([0, 0, 0])

const lightDirection = vec3.create()
vec3.set(lightDirection, 1, 1, 1)
vec3.normalize(lightDirection, lightDirection)

new CameraController(camera, canvas)

downloadFile('/assets/models/Suzanne.gltf', 'json', loadModel)
downloadFile('/assets/models/Suzanne.bin', 'arraybuffer', loadModel)

const linearFolder = gui.addFolder('linear fog')
linearFolder.open()
// linearFolder
//   .add(OPTIONS, 'fogNear')
//   .min(0)
//   .max(10)
//   .step(1)
//   .onChange((val) => gltfMesh.setUniform('fogNear', 'float', val))
linearFolder
  .add(OPTIONS, 'fogFar')
  .min(0)
  .max(150)
  .step(1)
  .onChange((val) => gltfMesh.setUniform('fogFar', 'float', val))

const exponentialFolder = gui.addFolder('exponential squared fog')
exponentialFolder.open()
exponentialFolder
  .add(OPTIONS, 'fogDensity')
  .min(0)
  .max(0.225)
  .step(0.001)
  .onChange((val) => gltfMesh2.setUniform('fogDensity', 'float', val))

const sharedUniforms = {
  time: { type: 'float', value: 0 },
  lightDirection: { type: 'vec3', value: lightDirection },
  fogColor: { type: 'vec4', value: FOG_COLOR },
  fogNear: { type: 'float', value: OPTIONS.fogNear },
  fogFar: { type: 'float', value: OPTIONS.fogFar },
  fogDensity: { type: 'float', value: OPTIONS.fogDensity },
}

document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
resize()
window.addEventListener('resize', resize)

function loadModel(xhr) {
  if (xhr.responseType === 'json') {
    gJson = xhr.response
  } else if (xhr.responseType === 'arraybuffer') {
    gBin = xhr.response
  }
  if (!gJson || !gBin) {
    return
  }
  const meshName = 'Suzanne'
  const prim = GLTF.getMesh(meshName, gJson, gBin)

  const indices = prim[0].indices.data
  const vertices = prim[0].vertices.data
  const uvs = prim[0].uv.data
  const normals = prim[0].normal.data

  const colors = new Float32Array(INSTANCE_COUNT * 3)

  for (let i = 0; i < indices.length; i++) {
    colors[i * 3 + 0] = Math.random()
    colors[i * 3 + 1] = Math.random()
    colors[i * 3 + 2] = Math.random()
  }

  const geometry = new Geometry(gl)
  geometry
    .addIndex({
      typedArray: indices,
    })
    .addAttribute('position', {
      typedArray: vertices,
      size: 3,
    })
    .addAttribute('uv', {
      typedArray: uvs,
      size: 2,
    })
    .addAttribute('normal', {
      typedArray: normals,
      size: 3,
    })
    .addAttribute('color', {
      typedArray: colors,
      size: 3,
      instancedDivisor: 1,
    })

  gltfMesh = new InstancedMesh(gl, {
    geometry,
    instanceCount: INSTANCE_COUNT,
    uniforms: {
      ...sharedUniforms,
    },
    vertexShaderSource,
    fragmentShaderSource: getFragmentShaderSource(true),
  })

  gltfMesh2 = new InstancedMesh(gl, {
    geometry,
    instanceCount: INSTANCE_COUNT,
    uniforms: {
      ...sharedUniforms,
    },
    vertexShaderSource,
    fragmentShaderSource: getFragmentShaderSource(false),
  })

  let i = 0
  const scaleX = 5
  const scaleY = 5
  const scaleZ = 10
  for (let x = 0; x < INSTANCE_COUNT_X; x++) {
    for (let y = 0; y < INSTANCE_COUNT_Y; y++) {
      for (let z = 0; z < INSTANCE_COUNT_Z; z++) {
        mat4.identity(transformMatrix)
        vec3.set(
          translateVec3,
          x * scaleX - (INSTANCE_COUNT_X * scaleX - scaleX) / 2,
          y * scaleY - (INSTANCE_COUNT_Y * scaleY - scaleY) / 2,
          -z * scaleZ,
        )
        mat4.translate(transformMatrix, transformMatrix, translateVec3)
        gltfMesh.setMatrixAt(i, transformMatrix)
        gltfMesh2.setMatrixAt(i, transformMatrix)
        i++
      }
    }
  }
}

function updateFrame(ts) {
  ts /= 1000
  const dt = ts - oldTime
  oldTime = ts

  stats.begin()

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(...FOG_COLOR)
  gl.scissor(0, 0, gl.drawingBufferWidth / 2, gl.drawingBufferHeight)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  if (gltfMesh) {
    gltfMesh.use().setUniform('time', 'float', ts).setCamera(camera).draw()
  }

  gl.scissor(
    gl.drawingBufferWidth / 2,
    0,
    gl.drawingBufferWidth,
    gl.drawingBufferHeight,
  )
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  if (gltfMesh2) {
    gltfMesh2.use().setUniform('time', 'float', ts).setCamera(camera).draw()
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

function downloadFile(url, type, callback) {
  const xhr = new XMLHttpRequest()
  xhr.addEventListener(
    'load',
    (e) => {
      if (xhr.status !== 200) {
        // ...
      }
      callback(xhr)
    },
    false,
  )
  xhr.addEventListener(
    'error',
    (e) => {
      // ...
    },
    false,
  )
  xhr.addEventListener(
    'abort',
    (e) => {
      // ...
    },
    false,
  )
  xhr.addEventListener(
    'timeout',
    (e) => {
      // ...
    },
    false,
  )

  xhr.open('GET', url)
  xhr.responseType = type

  try {
    xhr.send()
  } catch (err) {
    console.error(`Could not send XHR: ${err}`)
  }
}
