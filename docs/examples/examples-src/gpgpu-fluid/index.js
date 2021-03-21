import Stats from 'stats-js'
import { mat4 } from 'gl-matrix'

import {
  Geometry,
  GeometryUtils,
  Mesh,
  Texture,
  getExtension,
} from '../../../../dist/esm'

const VERTEX_SHADER_UPDATE_POSITIONS = `
  attribute vec4 position;

  void main () {
    gl_Position = position;
  }
`

const FRAGMENT_SHADER_UPDATE_POSITIONS = `
  uniform sampler2D positionsTexture;
  uniform sampler2D velocitiesTexture;
  uniform vec2 textureDimensions;
  uniform vec2 canvasDimensions;
  uniform vec3 mousePos;
  uniform float deltaTime;

  vec2 euclideanModulo(vec2 n, vec2 m) {
    return mod(mod(n, m) + m, m);
  }

  void main () {
    vec2 texCoords = gl_FragCoord.xy / textureDimensions;
    vec2 position = texture2D(positionsTexture, texCoords).xy;
    vec2 velocity = texture2D(velocitiesTexture, texCoords).xy;
    vec2 newPosition = euclideanModulo(position + velocity * deltaTime, canvasDimensions);

    float dist = distance(position, mousePos.xy);
    float maxDist = mousePos.z;

    newPosition.x -= (maxDist - clamp(dist, -maxDist, maxDist)) * velocity.x * 0.1;
    newPosition.y -= (maxDist - clamp(dist, -maxDist, maxDist)) * velocity.y * 0.1;

    gl_FragColor = vec4(newPosition, 1, 1);
  }
`

const VERTEX_SHADER_PARTICLES = `
  attribute vec4 position;
  
  uniform sampler2D positionsTexture;
  uniform vec2 textureDimensions;

  vec4 getValFromTextureArray (sampler2D texture, vec2 dimensions, float index) {
    float y = floor(index / dimensions.x);
    float x = mod(index, dimensions.x);
    vec2 texCoords = (vec2(x, y) + 0.5) / dimensions;
    return texture2D(texture, texCoords);
  }

  void main () {
    float id = position.x;
    vec4 newPos = getValFromTextureArray(positionsTexture, textureDimensions, id);
    gl_Position = projectionMatrix * vec4(newPos.xy, 0, 1);
    gl_PointSize = 2.0;
  }
`

const FRAGMENT_SHADER_PARTICLES = `
  void main () {
    gl_FragColor = vec4(vec3(0.4), 1.0);
  }
`

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = devicePixelRatio
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
const errorLogWrapper = document.getElementById('error-log')
const infoLogWrapper = document.getElementById('info-log')

checkExtensionsSupport()

const orthoProjectionMatrix = mat4.create()
{
  const left = 0
  const right = innerWidth
  const bottom = 0
  const top = innerHeight
  const near = -1
  const far = 1
  mat4.ortho(orthoProjectionMatrix, left, right, bottom, top, near, far)
}

const particleTexWidth = 500
const particleTexHeight = 500
const numParticles = particleTexWidth * particleTexHeight

infoLogWrapper.innerText = `Rendering ${humanizeNumber(numParticles)} particles`

const ids = new Array(numParticles).fill().map((_, i) => i)
const positions = new Float32Array(
  ids.map((_) => [rand(innerWidth), rand(innerHeight), 0, 0]).flat(),
)
const velocities = new Float32Array(
  ids.map((_) => [rand(-300, 300), rand(-300, 300), 0, 0]).flat(),
)

const velicityTexture = new Texture(gl, {
  image: velocities,
  width: particleTexWidth,
  height: particleTexHeight,
  format: gl.RGBA,
  internalFormat: gl.RGBA,
  minFilter: gl.NEAREST,
  magFilter: gl.NEAREST,
  type: gl.FLOAT,
})
const positionTex1 = new Texture(gl, {
  image: positions,
  width: particleTexWidth,
  height: particleTexHeight,
  format: gl.RGBA,
  internalFormat: gl.RGBA,
  minFilter: gl.NEAREST,
  magFilter: gl.NEAREST,
  type: gl.FLOAT,
})
const positionTex2 = new Texture(gl, {
  image: null,
  width: particleTexWidth,
  height: particleTexHeight,
  format: gl.RGBA,
  internalFormat: gl.RGBA,
  minFilter: gl.NEAREST,
  magFilter: gl.NEAREST,
  type: gl.FLOAT,
})

const positionsFB1 = createFramebuffer(gl, positionTex1.texture)
const positionsFB2 = createFramebuffer(gl, positionTex2.texture)

let oldTime = 0
let oldPositionsInfo = {
  fb: positionsFB1,
  tex: positionTex1.texture,
}
let newPositionsInfo = {
  fb: positionsFB2,
  tex: positionTex2.texture,
}
let updatePositionsMesh
let drawMesh
let oldMouseX = innerWidth / 2
let oldMouseY = innerHeight / 2

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
gl.enable(gl.DEPTH_TEST)

{
  const { vertices } = GeometryUtils.createFullscreenQuad()
  const geometry = new Geometry(gl)
  geometry.addAttribute('position', { typedArray: vertices, size: 2 })

  const textureDimensions = [particleTexWidth, particleTexHeight]
  const canvasDimensions = [innerWidth, innerHeight]
  updatePositionsMesh = new Mesh(gl, {
    geometry,
    uniforms: {
      positionsTexture: { type: 'int', value: 0 },
      velocitiesTexture: { type: 'int', value: 1 },
      textureDimensions: { type: 'vec2', value: textureDimensions },
      canvasDimensions: { type: 'vec2', value: canvasDimensions },
      mousePos: { type: 'vec3', value: [innerWidth / 2, innerHeight / 2, 40] },
      deltaTime: { type: 'float', value: 0 },
    },
    vertexShaderSource: VERTEX_SHADER_UPDATE_POSITIONS,
    fragmentShaderSource: FRAGMENT_SHADER_UPDATE_POSITIONS,
  })
}

{
  const geometry = new Geometry(gl)
  geometry.addAttribute('position', {
    typedArray: new Float32Array(ids),
    size: 1,
  })
  const textureDimensions = [particleTexWidth, particleTexHeight]
  drawMesh = new Mesh(gl, {
    geometry,
    uniforms: {
      positionsTexture: { type: 'int', value: 0 },
      textureDimensions: { type: 'vec2', value: textureDimensions },
      projectionMatrix: { type: 'mat4', value: orthoProjectionMatrix },
    },
    vertexShaderSource: VERTEX_SHADER_PARTICLES,
    fragmentShaderSource: FRAGMENT_SHADER_PARTICLES,
  })
  drawMesh.drawMode = 0
}

document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
resize()
window.addEventListener('resize', resize)
document.addEventListener('mousemove', (e) => {
  const dx = Math.min(e.pageX - oldMouseX, 100)
  const dy = Math.min(e.pageY - oldMouseY, 100)
  const dist = Math.sqrt(dx * dx + dy * dy)
  console.log(dx, dy)
  oldMouseX = e.pageX
  oldMouseY = e.pageY
  updatePositionsMesh.setUniform('mousePos', 'vec3', [
    e.pageX,
    innerHeight - e.pageY,
    dist + 20,
  ])
})

function updateFrame(ts) {
  ts /= 4000
  const dt = ts - oldTime
  oldTime = ts

  stats.begin()
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.9, 0.9, 0.9, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // gl.viewport(0, 0, particleTexWidth, particleTexHeight)
  // gl.activeTexture(gl.TEXTURE0)
  // gl.bindTexture(gl.TEXTURE_2D, oldPositionsInfo.tex)
  // gl.activeTexture(gl.TEXTURE0 + 1)
  // gl.bindTexture(gl.TEXTURE_2D, velicityTexture.texture)

  // updatePositionsMesh.setUniform('deltaTime', 'float', dt).draw()

  gl.bindFramebuffer(gl.FRAMEBUFFER, newPositionsInfo.fb)
  gl.viewport(0, 0, particleTexWidth, particleTexHeight)

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, oldPositionsInfo.tex)
  gl.activeTexture(gl.TEXTURE0 + 1)
  gl.bindTexture(gl.TEXTURE_2D, velicityTexture.texture)

  updatePositionsMesh.setUniform('deltaTime', 'float', dt).draw()

  // {
  //   const results = new Uint8Array(particleTexWidth * particleTexHeight * 4)
  //   gl.readPixels(
  //     0,
  //     0,
  //     particleTexWidth,
  //     particleTexHeight,
  //     gl.RGBA,
  //     gl.FLOAT,
  //     results,
  //   )
  //   debugger
  // }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, newPositionsInfo.tex)

  drawMesh.draw()

  {
    const temp = oldPositionsInfo
    oldPositionsInfo = newPositionsInfo
    newPositionsInfo = temp
  }
  stats.end()

  requestAnimationFrame(updateFrame)
}

function rand(min, max) {
  if (max === undefined) {
    max = min
    min = 0
  }
  return Math.random() * (max - min) + min
}

function resize() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}

function createFramebuffer(gl, tex) {
  const fb = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    tex,
    0,
  )
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  return fb
}

function checkExtensionsSupport() {
  // check we can use floating point textures
  const ext1 = getExtension(gl, 'OES_texture_float')
  if (!ext1) {
    errorLogWrapper.innerHTML += `
    <p>⚠️ Need OES_texture_float</p>
  `
  }
  // check we can render to floating point textures
  const ext2 = getExtension(gl, 'WEBGL_color_buffer_float')
  if (!ext2) {
    errorLogWrapper.innerHTML += `
    <p>⚠️ Need WEBGL_color_buffer_float</p>
  `
  }
  // check we can use textures in a vertex shader
  if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) < 1) {
    errorLogWrapper.innerHTML += `
    <p>⚠️ Can not use textures in vertex shaders</p>
  `
  }
}

function humanizeNumber(number, { digits = 0 } = {}) {
  const THOUSAND = 1000
  const MILLION = 1000000
  const BILLION = 1000000000

  const roundingBase = Math.pow(10, digits)
  if (number > BILLION) {
    return `${Math.round((number / BILLION) * roundingBase) / roundingBase}mrd`
  }
  if (number > MILLION) {
    return `${Math.round((number / MILLION) * roundingBase) / roundingBase}m`
  }
  if (number > THOUSAND) {
    return `${Math.round((number / THOUSAND) * roundingBase) / roundingBase}k`
  }
}
