import { mat4, vec3 } from 'gl-matrix'
import Stats from 'stats-js'
import throttle from 'lodash.throttle'

import {
  getExtension,
  PerspectiveCamera,
  OrthographicCamera,
  CameraController,
  Geometry,
  GeometryUtils,
  Mesh,
  Texture,
  InstancedMesh,
  UNIFORM_TYPE_INT,
  UNIFORM_TYPE_VEC2,
  UNIFORM_TYPE_VEC3,
} from '../../../../dist/esm'

const VERTEX_SHADER_GBUFFER = `
  attribute vec4 position;
  attribute vec2 uv;
  attribute vec3 normal;

  varying vec2 v_uv;
  varying vec3 v_normal;
  varying vec3 v_position;

  void main () {
    vec4 worldPosition = modelMatrix * position;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;

    v_uv = uv;
    v_normal = (modelMatrix * vec4(normal, 0.0)).xyz;
    v_position = worldPosition.xyz;
  }
`
const FRAGMENT_SHADER_GBUFFER = `
  #extension GL_EXT_draw_buffers : require
  precision highp float;

  varying vec2 v_uv;
  varying vec3 v_normal;
  varying vec3 v_position;

  void main () {

    gl_FragData[0] = vec4(v_position, 0.0);
    gl_FragData[1] = vec4(normalize(v_normal.xyz), 0.0);
    gl_FragData[2] = vec4(v_uv, 0.0, 0.0);
  }
`

const VERTEX_SHADER_LIGHTING = `
  attribute vec4 position;
  attribute vec3 color;
  attribute mat4 instanceModelMatrix;

  varying vec3 v_lightWorldPosition;
  varying vec3 v_color;

  void main () {
    vec4 worldPosition = modelMatrix * instanceModelMatrix * position;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
    
    v_lightWorldPosition = worldPosition.xyz;
    v_color = color;
  }
`

const FRAGMENT_SHADER_LIGHTING = `
  precision highp float;

  uniform sampler2D positionTexture;
  uniform sampler2D normalTexture;
  uniform sampler2D colorTexture;
  uniform sampler2D texture;

  uniform vec3 eyePosition;
  uniform vec2 resolution;

  varying vec3 v_lightWorldPosition;
  varying vec3 v_color;

  void main () {
    vec2 fragCoord = gl_FragCoord.xy / resolution;

    vec3 position = texture2D(positionTexture, fragCoord).xyz;
    vec3 normal = normalize(texture2D(normalTexture, fragCoord).xyz);
    vec2 uv = texture2D(colorTexture, fragCoord).xy;

    vec3 eyeDirection = normalize(eyePosition - position);
    vec3 lightVec = v_lightWorldPosition - position;
    float attenuation = 1.0 - length(lightVec);

    vec3 lightDirection = normalize(lightVec);
    vec3 reflectionDirection = reflect(-lightDirection, normal);
    float nDotL = max(dot(lightDirection, normal), 0.0);

    vec3 diffuse = nDotL * v_color;
    float ambient = 0.25;
    vec3 specular = pow(max(dot(reflectionDirection, eyeDirection), 0.0), 10.0) * v_color;
  
    vec4 baseColor = texture2D(texture, uv);

    gl_FragColor = vec4(attenuation * (ambient + diffuse + specular) * baseColor.rgb, baseColor.a);
    // gl_FragColor = vec4(vec3(attenuation), 1.0);

    // gl_FragColor = vec4(0.1, 0.0, 0.0, 0.01);

    // gl_FragColor = vec4(uv, 0.0, 1.0);

  }
`

const possibleColors = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [0, 1, 0],
]
const lightPositions = [
  [-1.8460756451259845, -10.5326157780950695, -0.8501768035388659],
  [-1.6886470947973846, -10.3541314382509203, -0.9849650002184944],
  [-2, -3, 0],
  [0.51175500697923582, -0.7176899591288173, -1.173398318610027],
]

const LIGHTS_COUNT = 4

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = Math.min(devicePixelRatio, 2)
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

const lightTransformMatrices = []
const lightTranslateVecs = []

let drawMesh
let lightSpheres
let lightHelpers

gl.clearColor(0.0, 0.0, 0.0, 1.0)
gl.enable(gl.DEPTH_TEST)
gl.enable(gl.CULL_FACE)
gl.depthFunc(gl.LEQUAL)

const camera = new PerspectiveCamera(
  (45 * Math.PI) / 180,
  innerWidth / innerHeight,
  0.1,
  100,
)
camera.position = [4, 4, 4]
camera.lookAt([0, 0, 0])

new CameraController(camera, canvas)

const ext = getExtension(gl, 'WEBGL_draw_buffers')
if (!ext) {
  // TODO: handle missing extension
}

const ext2 = getExtension(gl, 'OES_texture_float')
if (!ext2) {
  // TODO: handle missing extension
}

const ext3 = getExtension(gl, 'WEBGL_depth_texture')
if (!ext3) {
  // TODO: handle missing extension
}

const gBuffer = gl.createFramebuffer()
gl.bindFramebuffer(gl.FRAMEBUFFER, gBuffer)

const texturePosition = new Texture(gl, { type: gl.FLOAT, format: gl.RGB })
  .bind()
  .fromSize(innerWidth, innerHeight)

gl.framebufferTexture2D(
  gl.FRAMEBUFFER,
  ext.COLOR_ATTACHMENT0_WEBGL,
  gl.TEXTURE_2D,
  texturePosition.getTexture(),
  0,
)

const textureNormal = new Texture(gl, { type: gl.FLOAT, format: gl.RGB })
  .bind()
  .fromSize(innerWidth, innerHeight)

gl.framebufferTexture2D(
  gl.FRAMEBUFFER,
  ext.COLOR_ATTACHMENT1_WEBGL,
  gl.TEXTURE_2D,
  textureNormal.getTexture(),
  0,
)
const textureColor = new Texture(gl, { type: gl.FLOAT, format: gl.RGB })
  .bind()
  .fromSize(innerWidth, innerHeight)

gl.framebufferTexture2D(
  gl.FRAMEBUFFER,
  ext.COLOR_ATTACHMENT2_WEBGL,
  gl.TEXTURE_2D,
  textureColor.getTexture(),
  0,
)

var depthTexture = gl.createTexture()
gl.bindTexture(gl.TEXTURE_2D, depthTexture)
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.DEPTH_COMPONENT,
  innerWidth,
  innerHeight,
  0,
  gl.DEPTH_COMPONENT,
  gl.UNSIGNED_SHORT,
  null,
)
gl.framebufferTexture2D(
  gl.FRAMEBUFFER,
  gl.DEPTH_ATTACHMENT,
  gl.TEXTURE_2D,
  depthTexture,
  0,
)

if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
  console.log('cant use gBuffer!')
}

ext.drawBuffersWEBGL([
  ext.COLOR_ATTACHMENT0_WEBGL, // gl_FragData[0]
  ext.COLOR_ATTACHMENT1_WEBGL, // gl_FragData[1]
  ext.COLOR_ATTACHMENT2_WEBGL, // gl_FragData[2]
])
gl.bindFramebuffer(gl.FRAMEBUFFER, null)

const textureImage = new Texture(gl, { minFilter: gl.LINEAR_MIPMAP_LINEAR })
  .bind()
  .fromSize(512, 512)

const img = new Image()
img.onload = () => {
  textureImage.bind().fromImage(img).generateMipmap()
}
img.src = window.location.href.includes('github')
  ? '/hwoa-rang-gl/examples/dist/assets/textures/zhang-kaiyv-mh2o8DuHaMM-unsplash.png'
  : '/examples/dist/assets/textures/zhang-kaiyv-mh2o8DuHaMM-unsplash.png'

{
  const { indices, vertices, uv, normal } = GeometryUtils.createBox()
  const geometry = new Geometry(gl)
  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', { typedArray: vertices, size: 3 })
    .addAttribute('uv', { typedArray: uv, size: 2 })
    .addAttribute('normal', { typedArray: normal, size: 3 })

  drawMesh = new Mesh(gl, {
    geometry,
    uniforms: {},
    vertexShaderSource: VERTEX_SHADER_GBUFFER,
    fragmentShaderSource: FRAGMENT_SHADER_GBUFFER,
  })
}

{
  const { indices, vertices } = GeometryUtils.createSphere({
    widthSegments: 30,
    heightSegments: 8,
  })
  const geometry = new Geometry(gl)

  const colors = new Float32Array(LIGHTS_COUNT * 3)

  for (let i = 0; i < LIGHTS_COUNT; i++) {
    colors[i * 3 + 0] = possibleColors[i][0]
    colors[i * 3 + 1] = possibleColors[i][1]
    colors[i * 3 + 2] = possibleColors[i][2]
  }
  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', {
      typedArray: vertices,
      size: 3,
    })
    .addAttribute('color', {
      typedArray: colors,
      size: 3,
      instancedDivisor: 1,
    })
  lightSpheres = new InstancedMesh(gl, {
    geometry,
    uniforms: {
      positionTexture: { type: UNIFORM_TYPE_INT, value: 0 },
      normalTexture: { type: UNIFORM_TYPE_INT, value: 1 },
      colorTexture: { type: UNIFORM_TYPE_INT, value: 2 },
      texture: { type: UNIFORM_TYPE_INT, value: 3 },
      eyePosition: { type: UNIFORM_TYPE_VEC3, value: [0, 0, 5] },
      resolution: { type: UNIFORM_TYPE_VEC2, value: [innerWidth, innerHeight] },
    },
    instanceCount: LIGHTS_COUNT,
    vertexShaderSource: VERTEX_SHADER_LIGHTING,
    fragmentShaderSource: FRAGMENT_SHADER_LIGHTING,
  })

  {
    const { indices, vertices } = GeometryUtils.createBox({
      width: 0.1,
      height: 0.1,
      depth: 0.1,
    })
    const geometry = new Geometry(gl)
    geometry
      .addIndex({ typedArray: indices })
      .addAttribute('position', { typedArray: vertices, size: 3 })
    lightHelpers = new InstancedMesh(gl, {
      geometry,
      instanceCount: LIGHTS_COUNT,
      vertexShaderSource: `
        attribute vec4 position;
        attribute mat4 instanceModelMatrix;

        void main () {
          gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceModelMatrix * position;
        }
      `,
      fragmentShaderSource: `
        void main () {
          gl_FragColor = vec4(0.05);
        }
      `,
    })
    lightHelpers.drawMode = gl.LINE_LOOP
  }

  for (let i = 0; i < LIGHTS_COUNT; i++) {
    const randX = lightPositions[i][0]
    const randY = lightPositions[i][1]
    const randZ = lightPositions[i][2]

    const transformMatrix = mat4.create()
    const translateVec = vec3.fromValues(randX, randY, randZ)

    const scale = 6.25
    const scaleVec = vec3.fromValues(scale, scale, scale)

    mat4.translate(transformMatrix, transformMatrix, translateVec)
    mat4.scale(transformMatrix, transformMatrix, scaleVec)

    lightSpheres.setMatrixAt(i, transformMatrix)

    const helperMatrix = mat4.create()
    mat4.translate(helperMatrix, helperMatrix, translateVec)
    // mat4.scale(helperMatrix, helperMatrix, scaleVec)
    lightHelpers.setMatrixAt(i, helperMatrix)

    lightTransformMatrices.push(transformMatrix)
    lightTranslateVecs.push(translateVec)
  }
}

document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
sizeCanvas()
window.addEventListener('resize', throttle(resize, 100))

function updateFrame(ts) {
  ts /= 1000

  stats.begin()

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.blendFunc(gl.ONE, gl.ONE)

  gl.bindFramebuffer(gl.FRAMEBUFFER, gBuffer)

  gl.depthMask(true)
  gl.disable(gl.BLEND)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  drawMesh.use().setRotation({ x: 1, y: 1 }, ts).setCamera(camera).draw()

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.depthMask(false)
  gl.enable(gl.BLEND)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  gl.activeTexture(gl.TEXTURE0)
  texturePosition.bind()
  gl.activeTexture(gl.TEXTURE1)
  textureNormal.bind()
  gl.activeTexture(gl.TEXTURE2)
  textureColor.bind()
  gl.activeTexture(gl.TEXTURE3)
  textureImage.bind()

  lightSpheres
    .use()
    .setUniform('eyePosition', UNIFORM_TYPE_VEC3, camera.position)
    .setCamera(camera)
    .draw()

  lightHelpers.use().setCamera(camera).draw()

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
