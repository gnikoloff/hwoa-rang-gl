/**
 * Create and compile WebGLShader
 * @param {WebGLRenderingContext)} gl
 * @param {GLenum} shaderType
 * @param {string} shaderSource
 * @returns {WebGLShader}
 */
export declare function compileShader(gl: WebGLRenderingContext, shaderType: GLenum, shaderSource: string): WebGLShader | null;
/**
 * Create and link WebGLProgram with provided shader strings
 * @param {(WebGLRenderingContext)} gl
 * @param {string} vertexShaderSource
 * @param {string} fragmentShaderSource
 * @returns {WebGLProgram}
 */
export declare function createProgram(gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string): WebGLProgram | null;
/**
 * Create a ARRAY_BUFFER buffer
 * @param {WebGLRenderingContext)} gl
 * @param {ArrayBuffer} data - Typed array types that will be copied into the data store
 * @param {GLenum} [usage = gl.STATIC_DRAW] - A GLenum specifying the intended usage pattern of the data store for optimization purposes
 * @returns {WebGLBuffer}
 */
export declare function createBuffer(gl: WebGLRenderingContext, data: Float32Array | Float64Array, usage?: GLenum): WebGLBuffer | null;
/**
 * Create a ELEMENT_ARRAY_BUFFER buffer
 * @param {WebGLRenderingContext)} gl
 * @param {ArrayBuffer} data - Typed array types that will be copied into the data store
 * @param {GLenum} [usage=STATIC_DRAW] - A GLenum specifying the intended usage pattern of the data store for optimization purposes
 * @returns {WebGLBuffer}
 */
export declare function createIndexBuffer(gl: WebGLRenderingContext, indices: Uint16Array | Uint32Array, usage?: GLenum): WebGLBuffer | null;
/**
 * Obtains and returns a WebGL extension if available. Caches it in-memory for future use.
 * @param {WebGLRenderingContext)} gl
 * @param {string} extensionName
 * @param {boolean} caching
 */
export declare function getExtension(gl: WebGLRenderingContext, extensionName: string, caching?: boolean): any;
