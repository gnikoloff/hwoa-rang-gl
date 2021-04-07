import Stats from 'stats-js'
import throttle from 'lodash.throttle'

import {
  Geometry,
  Mesh,
  getExtension,
  SwapRenderer,
  GeometryUtils,
  PerspectiveCamera,
  OrthographicCamera,
  Texture,
  Framebuffer,
  UNIFORM_TYPE_INT,
  UNIFORM_TYPE_FLOAT,
  UNIFORM_TYPE_VEC2,
} from '../../../../dist/esm'

const VERTEX_SHADER_BASE = `
  attribute vec4 position;
  attribute vec2 uv;

  varying vec2 v_uv;

  void main () {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
    v_uv = uv;
  }
`

const FRAGMENT_SHADER_IMAGE = `
  uniform sampler2D texture;
  
  varying vec2 v_uv;

  void main(){
    gl_FragColor = texture2D(texture, v_uv);
  }
`

const FRAGMENT_SHADER_ADVECT = `
  uniform sampler2D velocity;
  uniform sampler2D target;
  uniform float dt;
  uniform float rdx; //reciprocal of grid scale, used to scale velocity into simulation domain
  uniform vec2 uWindow;

  varying vec2 v_uv;

  void main(void){
    float kernel[9];
    vec2  offset[9];
    vec4 col = vec4(0.0);

    vec2 tracedPos = vec2(v_uv.x * uWindow.x, v_uv.y * uWindow.y) - 500. * dt * rdx * (texture2D(velocity, v_uv).xy - vec2(0.5, 0.5));

    float dx = 1.0/uWindow.x;
    float dy = 1.0/uWindow.y;

    offset[0] = vec2(-dx, -dy);
    offset[1] = vec2(0.0, -dy);
    offset[2] = vec2(dx, -dy);

    offset[3] = vec2(-dx, 0.0);
    offset[4] = vec2(0.0, 0.0);
    offset[5] = vec2(dx, 0.0);

    offset[6] = vec2(-dx, dy);
    offset[7] = vec2(0.0, dy);
    offset[8] = vec2(dx, dy);

    kernel[0] = 1.0/16.0;   kernel[1] = 2.0/16.0;   kernel[2] = 1.0/16.0;
    kernel[3] = 2.0/16.0;   kernel[4] = 4.0/16.0;   kernel[5] = 2.0/16.0;
    kernel[6] = 1.0/16.0;   kernel[7] = 2.0/16.0;   kernel[8] = 1.0/16.0;

    for(int i = 0; i < 9; i++){
        vec4 tmp = texture2D( target, vec2(tracedPos.x/uWindow.x, tracedPos.y/uWindow.y) + offset[i]);
        col += tmp * kernel[i];
    }

    //need to bilerp this result
    gl_FragColor = col;// mix(mix(tex11, tex21, t.x), mix(tex12, tex22, t.x), t.y);
  }
`

const FRAGMENT_SHADER_POST_FX = `
  uniform sampler2D texture;

  varying vec2 v_uv;

  void main () {
    gl_FragColor = texture2D(texture, v_uv);
  }
`

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = Math.min(devicePixelRatio, 2)
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
const errorLogWrapper = document.getElementById('error-log')

// getExtension(gl, 'GMAN_debug_helper')

let oldTime = 0
let imageMesh
let fullscreenQuadMesh
let framebufferSource
let framebufferTarget
let velocityTexture

// gl.enable(gl.BLEND)
// gl.blendEquation(gl.FUNC_ADD)
// gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

const camera = new PerspectiveCamera(
  (45 * Math.PI) / 180,
  innerWidth / innerHeight,
  0.1,
  100,
)
camera.position = [0, 0, 18]
camera.lookAt([0, 0, 0])

const orthoCamera = new OrthographicCamera(
  -innerWidth / 2,
  innerWidth / 2,
  innerHeight / 2,
  -innerHeight / 2,
  0.1,
  2,
)
orthoCamera.position = [0, 0, 1]
orthoCamera.lookAt([0, 0, 0])

const orthoCamera2 = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 2)
orthoCamera2.position = [0, 0, 1]
orthoCamera2.lookAt([0, 0, 0])

const swapRenderer = new SwapRenderer(gl)

{
  const { vertices, uv, indices } = GeometryUtils.createPlane({
    width: 640,
    height: 426,
  })
  const geometry = new Geometry(gl)
  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', { typedArray: vertices, size: 3 })
    .addAttribute('uv', { typedArray: uv, size: 2 })
  imageMesh = new Mesh(gl, {
    geometry,
    uniforms: {
      texture: { type: UNIFORM_TYPE_INT, value: 0 },
    },
    vertexShaderSource: VERTEX_SHADER_BASE,
    fragmentShaderSource: FRAGMENT_SHADER_IMAGE,
  })
}

{
  const { indices, vertices, uv } = GeometryUtils.createPlane()
  const geometry = new Geometry(gl)
  geometry
    .addIndex({ typedArray: indices })
    .addAttribute('position', { typedArray: vertices, size: 3 })
    .addAttribute('uv', { typedArray: uv, size: 2 })

  fullscreenQuadMesh = new Mesh(gl, {
    geometry,
    uniforms: {
      texture: { type: UNIFORM_TYPE_INT, value: 0 },
    },
    vertexShaderSource: VERTEX_SHADER_BASE,
    fragmentShaderSource: FRAGMENT_SHADER_POST_FX,
  })
}

const imageTexture = new Texture(gl, {
  minFilter: gl.LINEAR,
  magFilter: gl.LINEAR,
})

imageTexture.bind().fromSize(1, 1).setIsFlip()

const image = new Image()
image.onload = () => {
  imageTexture.bind().fromImage(image)

  framebufferSource = new Framebuffer(gl, {
    minFilter: gl.NEAREST,
    magFilter: gl.NEAREST,
    width: innerWidth,
    height: innerHeight,
    type: gl.FLOAT,
    format: gl.RGBA,
    depth: false,
  })

  framebufferTarget = new Framebuffer(gl, {
    minFilter: gl.NEAREST,
    magFilter: gl.NEAREST,
    width: innerWidth,
    height: innerHeight,
    type: gl.FLOAT,
    format: gl.RGBA,
    depth: false,
  })

  const unit = 10
  const scaledWidth = parseInt(innerWidth / unit) + 1
  const scaledHeight = parseInt(innerHeight / unit) + 1
  const scaledSize = scaledWidth * scaledHeight

  velocityTexture = new Texture(gl, {
    type: gl.FLOAT,
    format: gl.RGBA,
    minFilter: gl.NEAREST,
    magFilter: gl.NEAREST,
  })
  const velocityData = new Float32Array(scaledSize * 4)
  for (let i = 0; i < scaledSize * 4; i++) {
    velocityData[i] = Math.random()
    if (i % 4 === 3) {
      velocityData[i] = 0
    }
  }
  velocityTexture
    .bind()
    .fromData(velocityData, scaledWidth, scaledHeight)
    .unbind()

  framebufferSource.bind()
  gl.viewport(0, 0, innerWidth, innerHeight)
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  velocityTexture.bind()
  fullscreenQuadMesh.use().setCamera(orthoCamera2).draw()
  imageTexture.bind()
  imageMesh.use().setCamera(orthoCamera).draw()
  framebufferSource.unbind()

  framebufferTarget.bind()
  gl.viewport(0, 0, innerWidth, innerHeight)
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  velocityTexture.bind()
  fullscreenQuadMesh.use().setCamera(orthoCamera2).draw()
  imageTexture.bind()
  imageMesh.use().setCamera(orthoCamera).draw()
  framebufferTarget.unbind()

  // const ext = getExtension('GMAN_debug_helper')

  swapRenderer
    .addTexture('advect1', framebufferSource.texture)
    .addFramebuffer('advect1', framebufferSource)

    .addTexture('advect2', framebufferTarget.texture)
    .addFramebuffer('advect2', framebufferTarget)

    .createProgram('advect', VERTEX_SHADER_BASE, FRAGMENT_SHADER_ADVECT)
    .useProgram('advect')
    .setUniform('velocity', UNIFORM_TYPE_INT, 0)
    .setUniform('dt', UNIFORM_TYPE_FLOAT, 0)
    .setUniform('uWindow', UNIFORM_TYPE_VEC2, [innerWidth, innerHeight])
    .setUniform('rdx', UNIFORM_TYPE_FLOAT, 1)
}
// image.src = '/assets/textures/zhang-kaiyv-44yxPSPmtjg-unsplash.png'
// image.src = '/assets/textures/zhang-kaiyv-mh2o8DuHaMM-unsplash.png'
// image.src = '/assets/textures/zhang-kaiyv-Jt5a-wTJR1Q-unsplash.jpeg'
// image.src = '/assets/textures/zhang-kaiyv-G7oFLe-OW74-unsplash.jpeg'
image.src =
  '/examples/dist/assets/textures/zhang-kaiyv-MheaLsLj1to-unsplash.jpeg'
// image.src = '/assets/textures/texture04.jpeg'

checkExtensionsSupport()
document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
sizeCanvas()
window.addEventListener('resize', throttle(resize, 100))

document.body.addEventListener('click', () => {
  gl.disable(gl.BLEND)
  const unit = 10
  const scaledWidth = parseInt(innerWidth / unit) + 1
  const scaledHeight = parseInt(innerHeight / unit) + 1
  const scaledSize = scaledWidth * scaledHeight

  velocityTexture = new Texture(gl, {
    type: gl.FLOAT,
    format: gl.RGBA,
    minFilter: gl.NEAREST,
    magFilter: gl.NEAREST,
  })
  const velocityData = new Float32Array(scaledSize * 4)
  for (let i = 0; i < scaledSize * 4; i++) {
    velocityData[i] = Math.random()
    if (i % 4 === 3) {
      velocityData[i] = 0
    }
  }
  velocityTexture
    .bind()
    .fromData(velocityData, scaledWidth, scaledHeight)
    .unbind()

  framebufferSource.bind()
  gl.viewport(0, 0, innerWidth, innerHeight)
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  velocityTexture.bind()
  fullscreenQuadMesh.use().setCamera(orthoCamera2).draw()
  imageTexture.bind()
  imageMesh.use().setCamera(orthoCamera).draw()
  framebufferSource.unbind()

  framebufferTarget.bind()
  gl.viewport(0, 0, innerWidth, innerHeight)
  gl.clearColor(1, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  velocityTexture.bind()
  fullscreenQuadMesh.use().setCamera(orthoCamera2).draw()
  imageTexture.bind()
  imageMesh.use().setCamera(orthoCamera).draw()
  framebufferTarget.unbind()
})

function updateFrame(ts) {
  ts /= 1000
  const dt = ts - oldTime
  oldTime = ts

  stats.begin()

  const tex = swapRenderer.getTexture('advect2')
  if (tex) {
    gl.disable(gl.BLEND)

    swapRenderer
      .setSize(innerWidth, innerHeight)
      .useProgram('advect')
      .setUniform('dt', UNIFORM_TYPE_FLOAT, dt)
      .run(['advect1'], 'advect2')

    gl.clearColor(1, 1, 1, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    gl.blendEquation(gl.FUNC_ADD)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

    gl.activeTexture(gl.TEXTURE0)
    tex.bind()
    fullscreenQuadMesh.use().setCamera(orthoCamera2).draw()

    swapRenderer.swap('advect1', 'advect2')
  }

  stats.end()

  requestAnimationFrame(updateFrame)
}

function resize() {
  framebufferSource.updateWithSize(innerWidth, innerHeight)
  framebufferTarget.updateWithSize(innerWidth, innerHeight)

  swapRenderer
    .useProgram('advect')
    .setUniform('uWindow', UNIFORM_TYPE_VEC2, [innerWidth, innerHeight])

  sizeCanvas()
}

function sizeCanvas() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}

function checkExtensionsSupport() {
  // check we can use floating point textures
  const ext1 = getExtension(gl, 'OES_texture_float')
  if (!ext1) {
    errorLogWrapper.style.display = 'flex'
    errorLogWrapper.innerHTML += `
    <p>⚠️ Need OES_texture_float</p>
  `
  }
}
