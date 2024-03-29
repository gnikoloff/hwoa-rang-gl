import Stats from 'stats-js'
import throttle from 'lodash.throttle'

import {
  getExtension,
  SwapRenderer,
  UNIFORM_TYPE_INT,
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

const FRAGMENT_SHADER_BLUR = `
    uniform sampler2D texture;
    uniform vec2 uMouse;
    uniform vec2 uWindow;

    varying vec2 v_uv;

    float kernel[9];
    vec2 offset[9];

    void main(){
      vec4 sum = vec4(0.0);

      float distance = distance( uMouse, vec2(gl_FragCoord.xy) );

      if (distance < 200.0){
        sum = texture2D(texture, v_uv) * (1.00 + 0.03 * (1.0 - distance/200.0));// + vec4(1.0, 0.0, 0.0, 0.0);
      } else {
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
          vec4 tmp = texture2D(texture, v_uv + offset[i]);
          sum += tmp * kernel[i];
        }
      }
      gl_FragColor = sum;
      gl_FragColor.a = 0.999;
  }
`

const FRAGMENT_SHADER_DISPLAY = `
  uniform sampler2D tDiffuse;

  varying vec2 v_uv;

  void main () {
    gl_FragColor = texture2D(tDiffuse, v_uv);
  }
`

const BLUR1 = 'blur1'
const BLUR2 = 'blur2'
const VIS_PROGRAM = 'visualise'

const BLUR_PROGRAM = 'blur'

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = Math.min(devicePixelRatio, 2)
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
const errorLogWrapper = document.getElementById('error-log')

getExtension(gl, 'GMAN_debug_helper')

const swapRenderer = new SwapRenderer(gl)

swapRenderer
  .createProgram(BLUR_PROGRAM, VERTEX_SHADER_BASE, FRAGMENT_SHADER_BLUR)
  .useProgram(BLUR_PROGRAM)
  .setSize(innerWidth, innerHeight)
  .setUniform('texture', UNIFORM_TYPE_INT, 0)
  .setUniform('uMouse', UNIFORM_TYPE_VEC2, [-3000, -3000])
  .setUniform('uWindow', UNIFORM_TYPE_VEC2, [innerWidth, innerHeight])

  .createProgram(VIS_PROGRAM, VERTEX_SHADER_BASE, FRAGMENT_SHADER_DISPLAY)
  .useProgram(VIS_PROGRAM)
  .setUniform('tDiffuse', UNIFORM_TYPE_INT, 0)

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
gl.enable(gl.DEPTH_TEST)

// checkExtensionsSupport()
document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
resize()
window.addEventListener('resize', throttle(resize, 100))
document.addEventListener('mousemove', (e) => {
  swapRenderer
    .useProgram(BLUR_PROGRAM)
    .setUniform('uMouse', UNIFORM_TYPE_VEC2, [e.pageX, innerHeight - e.pageY])
})
document.addEventListener('touchmove', (e) => {
  swapRenderer
    .useProgram(BLUR_PROGRAM)
    .setUniform('uMouse', UNIFORM_TYPE_VEC2, [
      e.touches[0].pageX,
      innerHeight - e.touches[0].pageY,
    ])
})

function updateFrame() {
  stats.begin()

  swapRenderer
    .setSize(innerWidth, innerHeight)
    .useProgram(BLUR_PROGRAM)
    .run([BLUR1], BLUR2)
    .setSize(innerWidth * dpr, innerHeight * dpr)
    .run([BLUR1], null)
    .swap(BLUR1, BLUR2)

  stats.end()

  requestAnimationFrame(updateFrame)
}

function resize() {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)

  let initData
  let texType

  const ext = getExtension(gl, 'WEBGL_color_buffer_float')
  getExtension(gl, 'OES_texture_float')
  if (ext) {
    initData = new Float32Array(innerWidth * innerHeight * 4)
    texType = gl.FLOAT
  } else {
    const ext = getExtension(gl, 'EXT_color_buffer_half_float')
    const ext2 = getExtension(gl, 'OES_texture_half_float')
    if (ext) {
      initData = new Float32Array(innerWidth * innerHeight * 4)
      texType = ext2.HALF_FLOAT_OES
    } else {
      initData = new Uint8Array(innerWidth * innerHeight * 4)
      texType = gl.UNSIGNED_BYTE
    }
  }

  for (var i = 0; i < initData.length; i++) {
    initData[i] = (Math.random() - 0.5) * 255
  }

  swapRenderer
    .createTexture(
      BLUR1,
      innerWidth,
      innerHeight,
      initData,
      gl.NEAREST,
      texType,
    )
    .createFramebuffer(BLUR1, innerWidth, innerHeight)

    .createTexture(BLUR2, innerWidth, innerHeight, null, gl.NEAREST, texType)
    .createFramebuffer(BLUR2, innerWidth, innerHeight)

    .useProgram(BLUR_PROGRAM)
    .setUniform('uWindow', UNIFORM_TYPE_VEC2, [innerWidth, innerHeight])
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
