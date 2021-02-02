import VAO from './vao'
import {
  createProgram,
  createBuffer,
} from './gl-utils'

const dpr = devicePixelRatio
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

gl.isWebGL2 = gl instanceof WebGL2RenderingContext

document.body.appendChild(canvas)

const vertexShaderSource = `#version 300 es
  in vec4 a_position;

  void main () {
    gl_Position = a_position;
  }
`
const fragmentShaderSource = `#version 300 es
  precision highp float;
  
  out vec4 finalColor;
  
  void main () {
    finalColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`

const glProgram = createProgram(gl, vertexShaderSource, fragmentShaderSource)

const vao = new VAO(gl)

const a_positionLoc = gl.getAttribLocation(glProgram, 'a_position')

const count = 10

const positions = new Float32Array(count * 3)

for (let i = 0; i < count; i++) {
  positions[i * 3 + 0] = (Math.random() * 2 - 1)
  positions[i * 3 + 1] = (Math.random() * 2 - 1)
  positions[i * 3 + 2] = (Math.random() * 2 - 1)
}

vao.bind()

const vertexBuffer = createBuffer(gl, positions)
gl.vertexAttribPointer(a_positionLoc, 3, gl.FLOAT, false, 0, 0)
gl.enableVertexAttribArray(a_positionLoc)

vao.unbind()

resize()
window.addEventListener('resize', resize)
requestAnimationFrame(updateFrame)

function updateFrame (ts) {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.9, 0.9, 0.9, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  vao.bind()
  gl.useProgram(glProgram)
  gl.drawArrays(gl.LINE_STRIP, 0, count)
  gl.useProgram(null)
  vao.unbind()

  requestAnimationFrame(updateFrame)
}

function resize () {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', innerWidth)
  canvas.style.setProperty('height', innerHeight)
}