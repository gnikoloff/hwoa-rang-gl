import Stats from 'stats-js'
import { mat4 } from 'gl-matrix'

import {
  Geometry,
  Mesh,
  getExtension,
  SwapRenderer,
  GeometryUtils,
} from '../../../../dist/esm'

const VERTEX_SHADER_BASE = `
  attribute vec4 position;
  attribute vec2 uv;

  varying vec2 v_uv;

  void main () {
    gl_Position = position;

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

const BLUR_PROGRAM_1 = 'blur1'
const BLUR_PROGRAM_2 = 'blur2'

const stats = new Stats()
document.body.appendChild(stats.domElement)

const dpr = Math.min(devicePixelRatio, 2)
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
const errorLogWrapper = document.getElementById('error-log')

getExtension(gl, 'GMAN_debug_helper')

const swapRenderer = new SwapRenderer(gl)

swapRenderer
  .createProgram('blur', VERTEX_SHADER_BASE, FRAGMENT_SHADER_BLUR)
  .useProgram('blur')
  .setSize(innerWidth, innerHeight)
  .setUniform('texture', 'int', 0)
  .setUniform('uMouse', 'vec2', [-3000, -3000])
  .setUniform('uWindow', 'vec2', [innerWidth, innerHeight])

const initData = new Float32Array(innerWidth * innerHeight * 4)
for (var i = 0; i < initData.length; i++) {
  initData[i] = (Math.random() - 0.5) * 255
}

swapRenderer
  .createTexture(BLUR_PROGRAM_1, innerWidth, innerHeight, initData)
  .createFramebuffer(BLUR_PROGRAM_1, innerWidth, innerHeight)

swapRenderer
  .createTexture(BLUR_PROGRAM_2, innerWidth, innerHeight)
  .createFramebuffer(BLUR_PROGRAM_2, innerWidth, innerHeight)

let oldTime = 0
let drawMesh

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
gl.enable(gl.DEPTH_TEST)

{
  const { vertices, uv } = GeometryUtils.createFullscreenQuad()
  const geometry = new Geometry(gl)
  geometry
    .addAttribute('position', {
      typedArray: vertices,
      size: 2,
    })
    .addAttribute('uv', {
      typedArray: uv,
      size: 2,
    })
  drawMesh = new Mesh(gl, {
    geometry,
    uniforms: {
      tDiffuse: { type: 'int', value: 0 },
    },
    vertexShaderSource: VERTEX_SHADER_BASE,
    fragmentShaderSource: FRAGMENT_SHADER_DISPLAY,
  })
}

checkExtensionsSupport()
document.body.appendChild(canvas)
requestAnimationFrame(updateFrame)
resize()
window.addEventListener('resize', resize)
document.addEventListener('mousemove', (e) => {
  swapRenderer
    .useProgram('blur')
    .setUniform('uMouse', 'vec2', [e.pageX, innerHeight - e.pageY])
})

function updateFrame(ts) {
  ts /= 4000
  const dt = ts - oldTime
  oldTime = ts

  stats.begin()

  swapRenderer
    .setSize(innerWidth, innerHeight)
    .useProgram('blur')
    .run([BLUR_PROGRAM_1], BLUR_PROGRAM_2)

  gl.clearColor(0.9, 0.9, 0.9, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  const texture = swapRenderer.getTexture(BLUR_PROGRAM_1)

  gl.activeTexture(gl.TEXTURE0)
  texture.bind()

  drawMesh.draw()

  swapRenderer.swap(BLUR_PROGRAM_1, BLUR_PROGRAM_2)

  stats.end()

  requestAnimationFrame(updateFrame)
}

function resize() {
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
