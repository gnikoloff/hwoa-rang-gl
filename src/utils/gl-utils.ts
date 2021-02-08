import {
  STATIC_DRAW,
} from './gl-constants'

type WebGLContext = WebGLRenderingContext|WebGL2RenderingContext

export function compileShader (gl: WebGLContext, shaderType: number, shaderSource: string): WebGLShader {
  const shader: WebGLShader = gl.createShader(shaderType)
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

export function createProgram (gl: WebGLContext, vertexShaderSource: string, fragmentShaderSource: string): WebGLProgram {
  const vertexShader: WebGLShader | null = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader: WebGLShader | null = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

  const program: WebGLProgram = gl.createProgram()
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

export function createBuffer (gl: WebGLContext, data: Float32Array|Float64Array, usage: number = STATIC_DRAW): WebGLBuffer {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, usage)

  return buffer
}

export function createIndexBuffer (gl: WebGLContext, indices: Uint16Array|Uint32Array, usage: number = STATIC_DRAW): WebGLBuffer {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, usage)
  const count = indices.length
  return { count, buffer }
}

const cachedExtensions = new Map()
export function getExtension (gl: WebGLContext, extensionName: string): Object {
  if (cachedExtensions.has(extensionName)) {
    return cachedExtensions.get(extensionName)
  }
  const extension = gl.getExtension(extensionName)
  cachedExtensions.set(extensionName, extension)
  return extension
}
