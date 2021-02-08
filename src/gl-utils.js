import {
  STATIC_DRAW,
} from './gl-constants'

export function compileShader (gl, shaderType, shaderSource) {
  const shader = gl.createShader(shaderType)
  gl.shaderSource(shader, shaderSource)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader
  }
  console.error(`
    Error in ${shaderType === gl.VERTEX_SHADER ? 'Vertex' : 'Fragment'} shader:
    ${gl.getShaderInfoLog(shader)}
  `)
  gl.deleteShader(shader)
}

export function createProgram (gl, vertexShaderSource, fragmentShaderSource) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    // It is safe to detach and delete shaders once a program is linked 
    gl.detachShader(program, vertexShader)
    gl.deleteShader(vertexShader)
    gl.detachShader(program, fragmentShader)
    gl.deleteShader(fragmentShader)
    return program
  }
  console.error(gl.getProgramInfoLog(program))
  gl.deleteProgram(program)
}

export function createBuffer (gl, data, usage = STATIC_DRAW) {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, usage)

  return buffer
}

export function createIndexBuffer (gl, indices, usage = STATIC_DRAW) {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, usage)
  const count = indices.length
  return { count, buffer }
}

const cachedExtensions = new Map()
export function getExtension (gl, extensionName) {
  if (cachedExtensions.has(extensionName)) {
    return cachedExtensions.get(extensionName)
  }
  const extension = gl.getExtension(extensionName)
  cachedExtensions.set(extensionName, extension)
  return extension
}
