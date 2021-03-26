/**
 * Create and compile WebGLShader
 * @param {(WebGL1RenderingContext|WebGL2RenderingContext)} gl
 * @param {GLenum} shaderType
 * @param {string} shaderSource
 * @returns {WebGLShader}
 */
export declare function compileShader(gl: WebGLRenderingContext, shaderType: GLenum, shaderSource: string): WebGLShader;
/**
 * Create and link WebGLProgram with provided shader strings
 * @param {(WebGL1RenderingContext|WebGL2RenderingContext)} gl
 * @param {string} vertexShaderSource
 * @param {string} fragmentShaderSource
 * @returns {WebGLProgram}
 */
export declare function createProgram(gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string): WebGLProgram;
/**
 * Create a ARRAY_BUFFER buffer
 * @param {(WebGL1RenderingContext|WebGL2RenderingContext)} gl
 * @param {ArrayBuffer} data - Typed array types that will be copied into the data store
 * @param {GLenum} [usage = gl.STATIC_DRAW] - A GLenum specifying the intended usage pattern of the data store for optimization purposes
 * @returns {WebGLBuffer}
 */
export declare function createBuffer(gl: WebGLRenderingContext, data: Float32Array | Float64Array, usage?: GLenum): WebGLBuffer;
/**
 * Create a ELEMENT_ARRAY_BUFFER buffer
 * @param {(WebGL1RenderingContext|WebGL2RenderingContext)} gl
 * @param {ArrayBuffer} data - Typed array types that will be copied into the data store
 * @param {GLenum} [usage=STATIC_DRAW] - A GLenum specifying the intended usage pattern of the data store for optimization purposes
 * @returns {WebGLBuffer}
 */
export declare function createIndexBuffer(gl: WebGLRenderingContext, indices: Uint16Array | Uint32Array, usage?: GLenum): WebGLBuffer;
/**
 * Obtains and returns a WebGL extension if available. Caches it in-memory for future use.
 * @param {(WebGL1RenderingContext|WebGL2RenderingContext)} gl
 * @param {string} extensionName
 */
export declare function getExtension(gl: WebGLRenderingContext, extensionName: string): any;
