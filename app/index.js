import VAO from './vao'
import Program from './program'
import Camera from './camera'

import {
  createBuffer,
  createIndexBuffer,
} from './gl-utils'

import {
  createBox,
} from './geometry-utils'

const dpr = devicePixelRatio
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

gl.isWebGL2 = gl instanceof WebGL2RenderingContext

document.body.appendChild(canvas)

const vertexShaderSource = `#version 300 es
  uniform mat4 u_projectionMatrix;
  uniform mat4 u_modelViewMatrix;
  uniform float u_time;

  in vec4 a_position;

  mat4 rotation3d(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(
		  oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
      oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
      oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
		  0.0,                                0.0,                                0.0,                                1.0
	  );
  }

  vec3 rotate(vec3 v, vec3 axis, float angle) {
	  return (rotation3d(axis, angle) * vec4(v, 1.0)).xyz;
  }

  void main () {
    vec4 position = a_position;

    vec3 axis = vec3(1.0, 0.0, 0.0);
    float time = u_time;
    float twist = 2.0 * (sin(time) * 0.5 + 0.5);
    float angle = position.x + u_time;

    vec3 transformed = rotate(position.xyz, axis, angle);

    gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(transformed.xyz, 1.0);
  }
`
const fragmentShaderSource = `#version 300 es
  precision highp float;
  
  out vec4 finalColor;
  
  void main () {
    finalColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`

const camera = new Camera(gl, 45 * Math.PI / 180, innerWidth / innerHeight, 0.1, 100)
camera.position = [3, 3, 3]
camera.lookAt([0, 0, 0])

const glProgram = new Program(gl, {
  vertexShaderSource,
  fragmentShaderSource,
})

glProgram.bind()
glProgram.setUniform('u_projectionMatrix', 'matrix4fv', camera.projectionMatrix)
glProgram.setUniform('u_modelViewMatrix', 'matrix4fv', camera.modelViewMatrix)
glProgram.unbind()

const vao = new VAO(gl)

const a_positionLoc = glProgram.getAttribLocation('a_position')

const { indices, vertices } = createBox({
  width: 10,
  widthSegments: 50,
  depthSegments: 50,
  heightSegments: 50,
})
vao.bind()

createBuffer(gl, vertices)
gl.vertexAttribPointer(a_positionLoc, 3, gl.FLOAT, false, 0, 0)
gl.enableVertexAttribArray(a_positionLoc)

const { count } = createIndexBuffer(gl, indices)
// debugge
vao.unbind()

resize()
window.addEventListener('resize', resize)
requestAnimationFrame(updateFrame)

function updateFrame (ts) {
  ts /= 1000

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.9, 0.9, 0.9, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  vao.bind()
  glProgram.bind()

  glProgram.setUniform('u_time', 'float', ts)

  gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0)
  
  glProgram.unbind()
  vao.unbind()

  requestAnimationFrame(updateFrame)
}

function resize () {
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
}