import { STATIC_DRAW } from './gl-constants'

/**
 * Create and compile WebGLShader
 * @param {(WebGL1RenderingContext|WebGL2RenderingContext)} gl
 * @param {number} shaderType
 * @param {string} shaderSource
 * @returns {WebGLShader}
 */
export function compileShader(
  gl: WebGLRenderingContext,
  shaderType: number,
  shaderSource: string,
): WebGLShader {
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
  return
}

/**
 * Create and link WebGLProgram with provided shader strings
 * @param {(WebGL1RenderingContext|WebGL2RenderingContext)} gl
 * @param {string} vertexShaderSource
 * @param {string} fragmentShaderSource
 * @returns {WebGLProgram}
 */
export function createProgram(
  gl: WebGLRenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string,
): WebGLProgram {
  const vertexShader: WebGLShader = compileShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource,
  )
  const fragmentShader: WebGLShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  )

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

/**
 * Create a ARRAY_BUFFER buffer
 * @param {(WebGL1RenderingContext|WebGL2RenderingContext)} gl
 * @param {ArrayBuffer} data - Typed array types that will be copied into the data store
 * @param {number} [usage=STATIC_DRAW] - A GLenum specifying the intended usage pattern of the data store for optimization purposes
 * @returns {WebGLBuffer}
 */
export function createBuffer(
  gl: WebGLRenderingContext,
  data: Float32Array | Float64Array,
  usage: number = STATIC_DRAW,
): WebGLBuffer {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, usage)

  return buffer
}

/**
 * Create a ELEMENT_ARRAY_BUFFER buffer
 * @param {(WebGL1RenderingContext|WebGL2RenderingContext)} gl
 * @param {ArrayBuffer} data - Typed array types that will be copied into the data store
 * @param {number} [usage=STATIC_DRAW] - A GLenum specifying the intended usage pattern of the data store for optimization purposes
 * @returns {WebGLBuffer}
 */
export function createIndexBuffer(
  gl: WebGLRenderingContext,
  indices: Uint16Array | Uint32Array,
  usage: number = STATIC_DRAW,
): {
  buffer: WebGLBuffer
  count: number
} {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, usage)
  const count = indices.length
  return { count, buffer }
}

const cachedExtensions = new Map()
/**
 * Obtains and returns a WebGL extension if available. Caches it in-memory for future use.
 * @param {(WebGL1RenderingContext|WebGL2RenderingContext)} gl
 * @param {string} extensionName
 */
export function getExtension(
  gl: WebGLRenderingContext,
  extensionName: string,
): any {
  if (cachedExtensions.has(extensionName)) {
    return cachedExtensions.get(extensionName)
  }
  const extension = gl.getExtension(extensionName)
  cachedExtensions.set(extensionName, extension)
  return extension
}
