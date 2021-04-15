import { STATIC_DRAW } from './gl-constants'

/**
 * Create and compile WebGLShader
 * @param {WebGLRenderingContext)} gl
 * @param {GLenum} shaderType
 * @param {string} shaderSource
 * @returns {WebGLShader}
 */
export function compileShader(
  gl: WebGLRenderingContext,
  shaderType: GLenum,
  shaderSource: string,
): WebGLShader | null {
  const shader: WebGLShader | null = gl.createShader(shaderType)
  if (!shader) {
    console.error('Failed to create WebGL shader')
    return null
  }
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
  return null
}

/**
 * Create and link WebGLProgram with provided shader strings
 * @param {(WebGLRenderingContext)} gl
 * @param {string} vertexShaderSource
 * @param {string} fragmentShaderSource
 * @returns {WebGLProgram}
 */
export function createProgram(
  gl: WebGLRenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string,
): WebGLProgram | null {
  const vertexShader: WebGLShader | null = compileShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource,
  )

  if (!vertexShader) {
    return null
  }

  const fragmentShader: WebGLShader | null = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  )

  if (!fragmentShader) {
    return null
  }

  const program: WebGLProgram | null = gl.createProgram()
  if (!program) {
    console.error('failed to create a WebGL program')
    return null
  }
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  // It is safe to detach and delete shaders once a program is linked
  gl.detachShader(program, vertexShader)
  gl.deleteShader(vertexShader)
  gl.detachShader(program, fragmentShader)
  gl.deleteShader(fragmentShader)

  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return program
  }
  gl.deleteProgram(program)
  return null
}

/**
 * Create a ARRAY_BUFFER buffer
 * @param {WebGLRenderingContext)} gl
 * @param {ArrayBuffer} data - Typed array types that will be copied into the data store
 * @param {GLenum} [usage = gl.STATIC_DRAW] - A GLenum specifying the intended usage pattern of the data store for optimization purposes
 * @returns {WebGLBuffer}
 */
export function createBuffer(
  gl: WebGLRenderingContext,
  data: Float32Array | Float64Array,
  usage: GLenum = STATIC_DRAW,
): WebGLBuffer | null {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, usage)

  return buffer
}

/**
 * Create a ELEMENT_ARRAY_BUFFER buffer
 * @param {WebGLRenderingContext)} gl
 * @param {ArrayBuffer} data - Typed array types that will be copied into the data store
 * @param {GLenum} [usage=STATIC_DRAW] - A GLenum specifying the intended usage pattern of the data store for optimization purposes
 * @returns {WebGLBuffer}
 */
export function createIndexBuffer(
  gl: WebGLRenderingContext,
  indices: Uint16Array | Uint32Array,
  usage: GLenum = gl.STATIC_DRAW,
): WebGLBuffer | null {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, usage)
  return buffer
}

const cachedExtensions = new Map()
/**
 * Obtains and returns a WebGL extension if available. Caches it in-memory for future use.
 * @param {WebGLRenderingContext)} gl
 * @param {string} extensionName
 */
export function getExtension(gl: WebGLRenderingContext, extensionName: string) {
  if (cachedExtensions.has(extensionName)) {
    return cachedExtensions.get(extensionName)
  }
  const extension = gl.getExtension(extensionName)
  cachedExtensions.set(extensionName, extension)
  return extension
}
