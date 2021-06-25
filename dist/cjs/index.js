(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.hwoaRangGL = {}));
}(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }

    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    const MODEL_MATRIX_UNIFORM_NAME = 'modelMatrix';
    const VIEW_MATRIX_UNIFORM_NAME = 'viewMatrix';
    const PROJECTION_MATRIX_UNIFORM_NAME = 'projectionMatrix';

    const INDEX_ATTRIB_NAME = 'index';
    const POSITION_ATTRIB_NAME = 'position';
    const INSTANCED_OFFSET_MODEL_MATRIX = 'instanceModelMatrix';

    const UNIFORM_TYPE_INT = 'int';
    const UNIFORM_TYPE_FLOAT = 'float';
    const UNIFORM_TYPE_VEC2 = 'vec2';
    const UNIFORM_TYPE_VEC3 = 'vec3';
    const UNIFORM_TYPE_VEC4 = 'vec4';
    const UNIFORM_TYPE_MATRIX4X4 = 'mat4';

    const CUBE_SIDE_FRONT = 'front';
    const CUBE_SIDE_BACK = 'back';
    const CUBE_SIDE_TOP = 'top';
    const CUBE_SIDE_BOTTOM = 'bottom';
    const CUBE_SIDE_LEFT = 'left';
    const CUBE_SIDE_RIGHT = 'right';

    const POINTS = 0x0000;
    const LINES = 0x0001;
    const TRIANGLES = 0x0004;

    const STATIC_DRAW = 0x88e4;

    /**
     * Create and compile WebGLShader
     * @param {WebGLRenderingContext)} gl
     * @param {GLenum} shaderType
     * @param {string} shaderSource
     * @returns {WebGLShader}
     */
    function compileShader(gl, shaderType, shaderSource) {
        const shader = gl.createShader(shaderType);
        if (!shader) {
            console.error('Failed to create WebGL shader');
            return null;
        }
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader;
        }
        console.error(`
    Error in ${shaderType === gl.VERTEX_SHADER ? 'Vertex' : 'Fragment'} shader:
    ${gl.getShaderInfoLog(shader)}
  `);
        gl.deleteShader(shader);
        return null;
    }
    /**
     * Create and link WebGLProgram with provided shader strings
     * @param {(WebGLRenderingContext)} gl
     * @param {string} vertexShaderSource
     * @param {string} fragmentShaderSource
     * @returns {WebGLProgram}
     */
    function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
        const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        if (!vertexShader) {
            return null;
        }
        const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        if (!fragmentShader) {
            return null;
        }
        const program = gl.createProgram();
        if (!program) {
            console.error('failed to create a WebGL program');
            return null;
        }
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        // It is safe to detach and delete shaders once a program is linked
        gl.detachShader(program, vertexShader);
        gl.deleteShader(vertexShader);
        gl.detachShader(program, fragmentShader);
        gl.deleteShader(fragmentShader);
        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            return program;
        }
        console.error('Error linking program', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    /**
     * Create a ARRAY_BUFFER buffer
     * @param {WebGLRenderingContext)} gl
     * @param {ArrayBuffer} data - Typed array types that will be copied into the data store
     * @param {GLenum} [usage = gl.STATIC_DRAW] - A GLenum specifying the intended usage pattern of the data store for optimization purposes
     * @returns {WebGLBuffer}
     */
    function createBuffer(gl, data, usage = STATIC_DRAW) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, usage);
        return buffer;
    }
    /**
     * Create a ELEMENT_ARRAY_BUFFER buffer
     * @param {WebGLRenderingContext)} gl
     * @param {ArrayBuffer} data - Typed array types that will be copied into the data store
     * @param {GLenum} [usage=STATIC_DRAW] - A GLenum specifying the intended usage pattern of the data store for optimization purposes
     * @returns {WebGLBuffer}
     */
    function createIndexBuffer(gl, indices, usage = gl.STATIC_DRAW) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, usage);
        return buffer;
    }
    const cachedExtensions = new Map();
    /**
     * Obtains and returns a WebGL extension if available. Caches it in-memory for future use.
     * @param {WebGLRenderingContext)} gl
     * @param {string} extensionName
     */
    function getExtension(gl, extensionName) {
        if (cachedExtensions.has(extensionName)) {
            return cachedExtensions.get(extensionName);
        }
        const extension = gl.getExtension(extensionName);
        cachedExtensions.set(extensionName, extension);
        return extension;
    }

    const vertexShaderSourceHead = `
  uniform mat4 ${MODEL_MATRIX_UNIFORM_NAME};
  uniform mat4 ${VIEW_MATRIX_UNIFORM_NAME};
  uniform mat4 ${PROJECTION_MATRIX_UNIFORM_NAME};
`;

    const fragmentShaderSourceHead = `
  precision highp float;
`;

    var _gl, _program, _attribLocations, _uniformLocations;
    /**
     * Program class for compiling GLSL shaders and linking them in a WebGLProgram and managing its state
     *
     * @public
     */
    class Program {
        constructor(gl, params) {
            _gl.set(this, void 0);
            _program.set(this, void 0);
            _attribLocations.set(this, new Map());
            _uniformLocations.set(this, new Map());
            __classPrivateFieldSet(this, _gl, gl);
            const { vertexShaderSource: inputVertexShaderSource, fragmentShaderSource: inputFragmentShaderSource, } = params;
            const vertexShaderSource = `
      ${vertexShaderSourceHead}
      ${inputVertexShaderSource}
    `;
            const fragmentShaderSource = `
      ${fragmentShaderSourceHead}
      ${inputFragmentShaderSource}
    `;
            __classPrivateFieldSet(this, _program, createProgram(gl, vertexShaderSource, fragmentShaderSource));
            __classPrivateFieldSet(this, _attribLocations, new Map());
            __classPrivateFieldSet(this, _uniformLocations, new Map());
        }
        /**
         * Set uniform value. Query the uniform location if necessary and cache it in-memory for future use
         * @param {string} uniformName
         * @param {UniformType} uniformType
         * @param uniformValue
         * @returns {this}
         */
        setUniform(uniformName, uniformType, 
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        uniformValue) {
            if (!__classPrivateFieldGet(this, _program)) {
                console.error('invalid program');
                return null;
            }
            let uniformLocation;
            if (__classPrivateFieldGet(this, _uniformLocations).has(uniformName)) {
                uniformLocation = __classPrivateFieldGet(this, _uniformLocations).get(uniformName);
            }
            else {
                uniformLocation = __classPrivateFieldGet(this, _gl).getUniformLocation(__classPrivateFieldGet(this, _program), uniformName);
                __classPrivateFieldGet(this, _uniformLocations).set(uniformName, uniformLocation);
            }
            switch (uniformType) {
                case UNIFORM_TYPE_MATRIX4X4:
                    __classPrivateFieldGet(this, _gl).uniformMatrix4fv(uniformLocation, false, uniformValue);
                    break;
                case UNIFORM_TYPE_VEC2:
                    __classPrivateFieldGet(this, _gl).uniform2f(uniformLocation, uniformValue[0], uniformValue[1]);
                    break;
                case UNIFORM_TYPE_VEC3:
                    __classPrivateFieldGet(this, _gl).uniform3f(uniformLocation, uniformValue[0], uniformValue[1], uniformValue[2]);
                    break;
                case UNIFORM_TYPE_VEC4:
                    __classPrivateFieldGet(this, _gl).uniform4f(uniformLocation, uniformValue[0], uniformValue[1], uniformValue[2], uniformValue[3]);
                    break;
                case UNIFORM_TYPE_FLOAT:
                    __classPrivateFieldGet(this, _gl).uniform1f(uniformLocation, uniformValue);
                    break;
                case UNIFORM_TYPE_INT:
                    __classPrivateFieldGet(this, _gl).uniform1i(uniformLocation, uniformValue);
                    break;
                default:
                    console.error(`Unrecognised uniform type: ${uniformType}`);
                    return this;
            }
            return this;
        }
        /**
         * Get the location for an attribute
         * @param {string} attribName
         * @returns {number} attribLocation
         */
        getAttribLocation(attribName) {
            if (!__classPrivateFieldGet(this, _program)) {
                console.error('invalid program');
                return null;
            }
            if (__classPrivateFieldGet(this, _attribLocations).has(attribName)) {
                return __classPrivateFieldGet(this, _attribLocations).get(attribName);
            }
            const attribLocation = __classPrivateFieldGet(this, _gl).getAttribLocation(__classPrivateFieldGet(this, _program), attribName);
            // if (attribLocation === -1) {
            //   console.warn(`Could not query attribute ${attribName} location.`)
            // }
            __classPrivateFieldGet(this, _attribLocations).set(attribName, attribLocation);
            return attribLocation;
        }
        /**
         * Binds the program for use
         * @returns {this}
         */
        bind() {
            __classPrivateFieldGet(this, _gl).useProgram(__classPrivateFieldGet(this, _program));
            return this;
        }
        /**
         * Uninds the program for use
         * @returns {this}
         */
        unbind() {
            __classPrivateFieldGet(this, _gl).useProgram(null);
            return this;
        }
        /**
         * Deletes the program
         */
        delete() {
            __classPrivateFieldGet(this, _gl).deleteProgram(__classPrivateFieldGet(this, _program));
        }
    }
    _gl = new WeakMap(), _program = new WeakMap(), _attribLocations = new WeakMap(), _uniformLocations = new WeakMap();

    var _gl$1;
    /**
     * Geometry class to hold buffers and attributes for a mesh.
     * Accepts the data that makes up your model - indices, vertices, uvs, normals, etc.
     * The only required attribute & buffer to render is "position"
     *
     * @public
     */
    class Geometry {
        constructor(gl) {
            _gl$1.set(this, void 0);
            this.attributes = new Map();
            this.vertexCount = 0;
            __classPrivateFieldSet(this, _gl$1, gl);
        }
        /**
         * @description Set data into element array buffer
         * @param {WebGLElementBufferInterface} params
         * @returns {this}
         */
        addIndex(params) {
            const { typedArray } = params;
            const buffer = createIndexBuffer(__classPrivateFieldGet(this, _gl$1), typedArray);
            this.vertexCount = typedArray.length;
            this.attributes.set(INDEX_ATTRIB_NAME, { typedArray, buffer });
            return this;
        }
        /**
         * @description Add attribute as array buffer
         * @param {string} key - Name of attribute. Must match attribute name in your GLSL program
         * @param {WebGLArrayBufferInterface} params
         * @returns {this}
         */
        addAttribute(key, params) {
            const { typedArray, size = 1, type = __classPrivateFieldGet(this, _gl$1).FLOAT, normalized = false, stride = 0, offset = 0, instancedDivisor, } = params;
            const buffer = createBuffer(__classPrivateFieldGet(this, _gl$1), typedArray);
            if (key === POSITION_ATTRIB_NAME && !this.vertexCount) {
                this.vertexCount = typedArray.length / size;
            }
            this.attributes.set(key, {
                typedArray,
                size,
                type,
                normalized,
                stride,
                offset,
                buffer,
                instancedDivisor,
            });
            return this;
        }
        /**
         *
         * @param {string} key - Name of attribute. Must match attribute name in your GLSL program
         * @param {number} index - Index to start updating your typed array from
         * @param {number} size - How many items are to be updated
         * @param {Float32Array} subTypeArray - The whole or partial array to update your attribute with
         * @returns {this}
         */
        updateAttribute(key, index, size, subTypeArray) {
            const foundAttrib = this.attributes.get(key);
            if (!foundAttrib) {
                console.error('Could not locate an attribute to update');
            }
            const { buffer } = foundAttrib;
            // TODO: Move updating buffer to a helper method
            __classPrivateFieldGet(this, _gl$1).bindBuffer(__classPrivateFieldGet(this, _gl$1).ARRAY_BUFFER, buffer);
            __classPrivateFieldGet(this, _gl$1).bufferSubData(__classPrivateFieldGet(this, _gl$1).ARRAY_BUFFER, index * size * Float32Array.BYTES_PER_ELEMENT, subTypeArray);
            return this;
        }
        /**
         * @description Delete all buffers associated with this geometry
         */
        delete() {
            this.attributes.forEach(({ buffer }) => {
                __classPrivateFieldGet(this, _gl$1).deleteBuffer(buffer);
            });
            this.attributes.clear();
        }
    }
    _gl$1 = new WeakMap();

    /**
     * Common utilities
     * @module glMatrix
     */
    // Configuration Constants
    var EPSILON = 0.000001;
    var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
    if (!Math.hypot) Math.hypot = function () {
      var y = 0,
          i = arguments.length;

      while (i--) {
        y += arguments[i] * arguments[i];
      }

      return Math.sqrt(y);
    };

    /**
     * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
     * @module mat4
     */

    /**
     * Creates a new identity mat4
     *
     * @returns {mat4} a new 4x4 matrix
     */

    function create() {
      var out = new ARRAY_TYPE(16);

      if (ARRAY_TYPE != Float32Array) {
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
      }

      out[0] = 1;
      out[5] = 1;
      out[10] = 1;
      out[15] = 1;
      return out;
    }
    /**
     * Set a mat4 to the identity matrix
     *
     * @param {mat4} out the receiving matrix
     * @returns {mat4} out
     */

    function identity(out) {
      out[0] = 1;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = 1;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = 1;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
      out[15] = 1;
      return out;
    }
    /**
     * Translate a mat4 by the given vector
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to translate
     * @param {ReadonlyVec3} v vector to translate by
     * @returns {mat4} out
     */

    function translate(out, a, v) {
      var x = v[0],
          y = v[1],
          z = v[2];
      var a00, a01, a02, a03;
      var a10, a11, a12, a13;
      var a20, a21, a22, a23;

      if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
      } else {
        a00 = a[0];
        a01 = a[1];
        a02 = a[2];
        a03 = a[3];
        a10 = a[4];
        a11 = a[5];
        a12 = a[6];
        a13 = a[7];
        a20 = a[8];
        a21 = a[9];
        a22 = a[10];
        a23 = a[11];
        out[0] = a00;
        out[1] = a01;
        out[2] = a02;
        out[3] = a03;
        out[4] = a10;
        out[5] = a11;
        out[6] = a12;
        out[7] = a13;
        out[8] = a20;
        out[9] = a21;
        out[10] = a22;
        out[11] = a23;
        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
      }

      return out;
    }
    /**
     * Scales the mat4 by the dimensions in the given vec3 not using vectorization
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to scale
     * @param {ReadonlyVec3} v the vec3 to scale the matrix by
     * @returns {mat4} out
     **/

    function scale(out, a, v) {
      var x = v[0],
          y = v[1],
          z = v[2];
      out[0] = a[0] * x;
      out[1] = a[1] * x;
      out[2] = a[2] * x;
      out[3] = a[3] * x;
      out[4] = a[4] * y;
      out[5] = a[5] * y;
      out[6] = a[6] * y;
      out[7] = a[7] * y;
      out[8] = a[8] * z;
      out[9] = a[9] * z;
      out[10] = a[10] * z;
      out[11] = a[11] * z;
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
      return out;
    }
    /**
     * Rotates a matrix by the given angle around the X axis
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */

    function rotateX(out, a, rad) {
      var s = Math.sin(rad);
      var c = Math.cos(rad);
      var a10 = a[4];
      var a11 = a[5];
      var a12 = a[6];
      var a13 = a[7];
      var a20 = a[8];
      var a21 = a[9];
      var a22 = a[10];
      var a23 = a[11];

      if (a !== out) {
        // If the source and destination differ, copy the unchanged rows
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
      } // Perform axis-specific matrix multiplication


      out[4] = a10 * c + a20 * s;
      out[5] = a11 * c + a21 * s;
      out[6] = a12 * c + a22 * s;
      out[7] = a13 * c + a23 * s;
      out[8] = a20 * c - a10 * s;
      out[9] = a21 * c - a11 * s;
      out[10] = a22 * c - a12 * s;
      out[11] = a23 * c - a13 * s;
      return out;
    }
    /**
     * Rotates a matrix by the given angle around the Y axis
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */

    function rotateY(out, a, rad) {
      var s = Math.sin(rad);
      var c = Math.cos(rad);
      var a00 = a[0];
      var a01 = a[1];
      var a02 = a[2];
      var a03 = a[3];
      var a20 = a[8];
      var a21 = a[9];
      var a22 = a[10];
      var a23 = a[11];

      if (a !== out) {
        // If the source and destination differ, copy the unchanged rows
        out[4] = a[4];
        out[5] = a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
      } // Perform axis-specific matrix multiplication


      out[0] = a00 * c - a20 * s;
      out[1] = a01 * c - a21 * s;
      out[2] = a02 * c - a22 * s;
      out[3] = a03 * c - a23 * s;
      out[8] = a00 * s + a20 * c;
      out[9] = a01 * s + a21 * c;
      out[10] = a02 * s + a22 * c;
      out[11] = a03 * s + a23 * c;
      return out;
    }
    /**
     * Rotates a matrix by the given angle around the Z axis
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */

    function rotateZ(out, a, rad) {
      var s = Math.sin(rad);
      var c = Math.cos(rad);
      var a00 = a[0];
      var a01 = a[1];
      var a02 = a[2];
      var a03 = a[3];
      var a10 = a[4];
      var a11 = a[5];
      var a12 = a[6];
      var a13 = a[7];

      if (a !== out) {
        // If the source and destination differ, copy the unchanged last row
        out[8] = a[8];
        out[9] = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
      } // Perform axis-specific matrix multiplication


      out[0] = a00 * c + a10 * s;
      out[1] = a01 * c + a11 * s;
      out[2] = a02 * c + a12 * s;
      out[3] = a03 * c + a13 * s;
      out[4] = a10 * c - a00 * s;
      out[5] = a11 * c - a01 * s;
      out[6] = a12 * c - a02 * s;
      out[7] = a13 * c - a03 * s;
      return out;
    }
    /**
     * Generates a perspective projection matrix with the given bounds.
     * Passing null/undefined/no value for far will generate infinite projection matrix.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {number} fovy Vertical field of view in radians
     * @param {number} aspect Aspect ratio. typically viewport width/height
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum, can be null or Infinity
     * @returns {mat4} out
     */

    function perspective(out, fovy, aspect, near, far) {
      var f = 1.0 / Math.tan(fovy / 2),
          nf;
      out[0] = f / aspect;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = f;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[11] = -1;
      out[12] = 0;
      out[13] = 0;
      out[15] = 0;

      if (far != null && far !== Infinity) {
        nf = 1 / (near - far);
        out[10] = (far + near) * nf;
        out[14] = 2 * far * near * nf;
      } else {
        out[10] = -1;
        out[14] = -2 * near;
      }

      return out;
    }
    /**
     * Generates a orthogonal projection matrix with the given bounds
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {number} left Left bound of the frustum
     * @param {number} right Right bound of the frustum
     * @param {number} bottom Bottom bound of the frustum
     * @param {number} top Top bound of the frustum
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum
     * @returns {mat4} out
     */

    function ortho(out, left, right, bottom, top, near, far) {
      var lr = 1 / (left - right);
      var bt = 1 / (bottom - top);
      var nf = 1 / (near - far);
      out[0] = -2 * lr;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = -2 * bt;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = 2 * nf;
      out[11] = 0;
      out[12] = (left + right) * lr;
      out[13] = (top + bottom) * bt;
      out[14] = (far + near) * nf;
      out[15] = 1;
      return out;
    }
    /**
     * Generates a look-at matrix with the given eye position, focal point, and up axis.
     * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {ReadonlyVec3} eye Position of the viewer
     * @param {ReadonlyVec3} center Point the viewer is looking at
     * @param {ReadonlyVec3} up vec3 pointing up
     * @returns {mat4} out
     */

    function lookAt(out, eye, center, up) {
      var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
      var eyex = eye[0];
      var eyey = eye[1];
      var eyez = eye[2];
      var upx = up[0];
      var upy = up[1];
      var upz = up[2];
      var centerx = center[0];
      var centery = center[1];
      var centerz = center[2];

      if (Math.abs(eyex - centerx) < EPSILON && Math.abs(eyey - centery) < EPSILON && Math.abs(eyez - centerz) < EPSILON) {
        return identity(out);
      }

      z0 = eyex - centerx;
      z1 = eyey - centery;
      z2 = eyez - centerz;
      len = 1 / Math.hypot(z0, z1, z2);
      z0 *= len;
      z1 *= len;
      z2 *= len;
      x0 = upy * z2 - upz * z1;
      x1 = upz * z0 - upx * z2;
      x2 = upx * z1 - upy * z0;
      len = Math.hypot(x0, x1, x2);

      if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
      } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
      }

      y0 = z1 * x2 - z2 * x1;
      y1 = z2 * x0 - z0 * x2;
      y2 = z0 * x1 - z1 * x0;
      len = Math.hypot(y0, y1, y2);

      if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
      } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
      }

      out[0] = x0;
      out[1] = y0;
      out[2] = z0;
      out[3] = 0;
      out[4] = x1;
      out[5] = y1;
      out[6] = z1;
      out[7] = 0;
      out[8] = x2;
      out[9] = y2;
      out[10] = z2;
      out[11] = 0;
      out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
      out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
      out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
      out[15] = 1;
      return out;
    }

    /**
     * 3 Dimensional Vector
     * @module vec3
     */

    /**
     * Creates a new, empty vec3
     *
     * @returns {vec3} a new 3D vector
     */

    function create$1() {
      var out = new ARRAY_TYPE(3);

      if (ARRAY_TYPE != Float32Array) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
      }

      return out;
    }
    /**
     * Creates a new vec3 initialized with the given values
     *
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vec3} a new 3D vector
     */

    function fromValues(x, y, z) {
      var out = new ARRAY_TYPE(3);
      out[0] = x;
      out[1] = y;
      out[2] = z;
      return out;
    }
    /**
     * Set the components of a vec3 to the given values
     *
     * @param {vec3} out the receiving vector
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vec3} out
     */

    function set(out, x, y, z) {
      out[0] = x;
      out[1] = y;
      out[2] = z;
      return out;
    }
    /**
     * Adds two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {ReadonlyVec3} a the first operand
     * @param {ReadonlyVec3} b the second operand
     * @returns {vec3} out
     */

    function add(out, a, b) {
      out[0] = a[0] + b[0];
      out[1] = a[1] + b[1];
      out[2] = a[2] + b[2];
      return out;
    }
    /**
     * Subtracts vector b from vector a
     *
     * @param {vec3} out the receiving vector
     * @param {ReadonlyVec3} a the first operand
     * @param {ReadonlyVec3} b the second operand
     * @returns {vec3} out
     */

    function subtract(out, a, b) {
      out[0] = a[0] - b[0];
      out[1] = a[1] - b[1];
      out[2] = a[2] - b[2];
      return out;
    }
    /**
     * Scales a vec3 by a scalar number
     *
     * @param {vec3} out the receiving vector
     * @param {ReadonlyVec3} a the vector to scale
     * @param {Number} b amount to scale the vector by
     * @returns {vec3} out
     */

    function scale$1(out, a, b) {
      out[0] = a[0] * b;
      out[1] = a[1] * b;
      out[2] = a[2] * b;
      return out;
    }
    /**
     * Normalize a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {ReadonlyVec3} a vector to normalize
     * @returns {vec3} out
     */

    function normalize(out, a) {
      var x = a[0];
      var y = a[1];
      var z = a[2];
      var len = x * x + y * y + z * z;

      if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
      }

      out[0] = a[0] * len;
      out[1] = a[1] * len;
      out[2] = a[2] * len;
      return out;
    }
    /**
     * Computes the cross product of two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {ReadonlyVec3} a the first operand
     * @param {ReadonlyVec3} b the second operand
     * @returns {vec3} out
     */

    function cross(out, a, b) {
      var ax = a[0],
          ay = a[1],
          az = a[2];
      var bx = b[0],
          by = b[1],
          bz = b[2];
      out[0] = ay * bz - az * by;
      out[1] = az * bx - ax * bz;
      out[2] = ax * by - ay * bx;
      return out;
    }
    /**
     * Alias for {@link vec3.subtract}
     * @function
     */

    var sub = subtract;
    /**
     * Perform some operation over an array of vec3s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */

    (function () {
      var vec = create$1();
      return function (a, stride, offset, count, fn, arg) {
        var i, l;

        if (!stride) {
          stride = 3;
        }

        if (!offset) {
          offset = 0;
        }

        if (count) {
          l = Math.min(count * stride + offset, a.length);
        } else {
          l = a.length;
        }

        for (i = offset; i < l; i += stride) {
          vec[0] = a[i];
          vec[1] = a[i + 1];
          vec[2] = a[i + 2];
          fn(vec, vec, arg);
          a[i] = vec[0];
          a[i + 1] = vec[1];
          a[i + 2] = vec[2];
        }

        return a;
      };
    }());

    /**
     * 2 Dimensional Vector
     * @module vec2
     */

    /**
     * Creates a new, empty vec2
     *
     * @returns {vec2} a new 2D vector
     */

    function create$2() {
      var out = new ARRAY_TYPE(2);

      if (ARRAY_TYPE != Float32Array) {
        out[0] = 0;
        out[1] = 0;
      }

      return out;
    }
    /**
     * Perform some operation over an array of vec2s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */

    (function () {
      var vec = create$2();
      return function (a, stride, offset, count, fn, arg) {
        var i, l;

        if (!stride) {
          stride = 2;
        }

        if (!offset) {
          offset = 0;
        }

        if (count) {
          l = Math.min(count * stride + offset, a.length);
        } else {
          l = a.length;
        }

        for (i = offset; i < l; i += stride) {
          vec[0] = a[i];
          vec[1] = a[i + 1];
          fn(vec, vec, arg);
          a[i] = vec[0];
          a[i + 1] = vec[1];
        }

        return a;
      };
    }());

    /**
     * Base transform class to handle vectors and matrices
     *
     * @public
     */
    class Transform {
        constructor() {
            this.position = fromValues(0, 0, 0);
            this.rotation = fromValues(0, 0, 0);
            this.scale = fromValues(1, 1, 1);
            this.modelMatrix = create();
            this.shouldUpdate = false;
        }
        /**
         * @returns {this}
         */
        setPosition(position) {
            const { x = this.position[0], y = this.position[1], z = this.position[2], } = position;
            set(this.position, x, y, z);
            this.shouldUpdate = true;
            return this;
        }
        /**
         * Sets scale
         * @returns {this}
         */
        setScale(scale) {
            const { x = this.scale[0], y = this.scale[1], z = this.scale[2] } = scale;
            set(this.scale, x, y, z);
            this.shouldUpdate = true;
            return this;
        }
        /**
         * Sets rotation
         * @returns {this}
         */
        setRotation(rotation) {
            const { x = this.rotation[0], y = this.rotation[1], z = this.rotation[2], } = rotation;
            set(this.rotation, x, y, z);
            this.shouldUpdate = true;
            return this;
        }
        /**
         * Update model matrix with scale, rotation and translation
         * @returns {this}
         */
        updateModelMatrix() {
            identity(this.modelMatrix);
            translate(this.modelMatrix, this.modelMatrix, this.position);
            rotateX(this.modelMatrix, this.modelMatrix, this.rotation[0]);
            rotateY(this.modelMatrix, this.modelMatrix, this.rotation[1]);
            rotateZ(this.modelMatrix, this.modelMatrix, this.rotation[2]);
            scale(this.modelMatrix, this.modelMatrix, this.scale);
            this.shouldUpdate = false;
            return this;
        }
    }

    var _gl$2, _geometry;
    /**
     * Mesh class for holding the geometry, program and shaders for an object.
     *
     * @public
     */
    class Mesh extends Transform {
        constructor(gl, params) {
            super();
            _gl$2.set(this, void 0);
            _geometry.set(this, void 0);
            /**
             * DrawMode
             * @default gl.TRIANGLES
             */
            this.drawMode = TRIANGLES;
            const { geometry, uniforms = {}, defines = {} } = params;
            let { vertexShaderSource, fragmentShaderSource } = params;
            __classPrivateFieldSet(this, _gl$2, gl);
            __classPrivateFieldSet(this, _geometry, geometry
            // Assign defines to both vertex and fragment shaders
            );
            // Assign defines to both vertex and fragment shaders
            for (const [key, value] of Object.entries(defines)) {
                vertexShaderSource = `
        #define ${key} ${value}\n
        ${vertexShaderSource}
      `;
                fragmentShaderSource = `
        #define ${key} ${value}\n
        ${fragmentShaderSource}
      `;
            }
            // create mesh program and vertex array object
            this.program = new Program(gl, {
                vertexShaderSource,
                fragmentShaderSource,
            });
            this.vaoExtension = getExtension(gl, 'OES_vertex_array_object');
            this.vao = this.vaoExtension.createVertexArrayOES();
            this.hasIndices = geometry.attributes.has(INDEX_ATTRIB_NAME);
            // assign geometry attributes to mesh
            this.vaoExtension.bindVertexArrayOES(this.vao);
            geometry.attributes.forEach(({ size, type, normalized, stride, offset, buffer }, key) => {
                if (key === INDEX_ATTRIB_NAME) {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
                    return;
                }
                const location = this.program.getAttribLocation(key);
                if (location == null || location === -1) {
                    return;
                }
                __classPrivateFieldGet(this, _gl$2).bindBuffer(__classPrivateFieldGet(this, _gl$2).ARRAY_BUFFER, buffer);
                __classPrivateFieldGet(this, _gl$2).vertexAttribPointer(location, size, type, normalized, stride, offset);
                __classPrivateFieldGet(this, _gl$2).enableVertexAttribArray(location);
            });
            this.vaoExtension.bindVertexArrayOES(null);
            // assign uniforms to mesh
            this.program.bind();
            for (const [key, uniform] of Object.entries(uniforms)) {
                // @ts-ignore
                this.program.setUniform(key, uniform['type'], uniform['value']);
            }
            this.program.setUniform(MODEL_MATRIX_UNIFORM_NAME, UNIFORM_TYPE_MATRIX4X4, this.modelMatrix);
            this.program.unbind();
            return this;
        }
        /**
         *
         * @param {string} key - Name of attribute. Must match attribute name in your GLSL program
         * @param {number} index - Index to start updating your typed array from
         * @param {number} size - How many items are to be updated
         * @param {Float32Array} subTypeArray - The whole or partial array to update your attribute with
         * @returns {this}
         */
        updateGeometryAttribute(key, index, size, subTypeArray) {
            this.vaoExtension.bindVertexArrayOES(this.vao);
            __classPrivateFieldGet(this, _geometry).updateAttribute(key, index, size, subTypeArray);
            this.vaoExtension.bindVertexArrayOES(null);
            return this;
        }
        /**
         * Binds the program
         * @returns {this}
         */
        use() {
            this.program.bind();
            return this;
        }
        /**
         * Set uniform value. Query the uniform location if necessary and cache it in-memory for future use
         * @param {string} uniformName
         * @param {UniformType} uniformType
         * @param uniformValue
         * @returns {this}
         */
        setUniform(uniformName, uniformType, uniformValue) {
            this.program.setUniform(uniformName, uniformType, uniformValue);
            return this;
        }
        /**
         * Assign camera projection matrix and view matrix to model uniforms
         * @param {PerspectiveCamera|OrthographicCamera} camera
         * @returns {this}
         */
        setCamera(camera) {
            this.program.setUniform(PROJECTION_MATRIX_UNIFORM_NAME, UNIFORM_TYPE_MATRIX4X4, camera.projectionMatrix);
            this.program.setUniform(VIEW_MATRIX_UNIFORM_NAME, UNIFORM_TYPE_MATRIX4X4, camera.viewMatrix);
            return this;
        }
        /**
         * Renders the mesh
         * @returns {this}
         */
        draw() {
            if (this.shouldUpdate) {
                super.updateModelMatrix();
                this.program.setUniform(MODEL_MATRIX_UNIFORM_NAME, UNIFORM_TYPE_MATRIX4X4, this.modelMatrix);
            }
            this.vaoExtension.bindVertexArrayOES(this.vao);
            if (this.hasIndices) {
                __classPrivateFieldGet(this, _gl$2).drawElements(this.drawMode, __classPrivateFieldGet(this, _geometry).vertexCount, __classPrivateFieldGet(this, _gl$2).UNSIGNED_SHORT, 0);
            }
            else {
                __classPrivateFieldGet(this, _gl$2).drawArrays(this.drawMode, 0, __classPrivateFieldGet(this, _geometry).vertexCount);
            }
            this.vaoExtension.bindVertexArrayOES(null);
            return this;
        }
        /**
         * Deletes the geometry, program and VAO extension associated with the Mesh
         */
        delete() {
            __classPrivateFieldGet(this, _geometry).delete();
            this.program.delete();
            this.vaoExtension.deleteVertexArrayOES(this.vao);
        }
    }
    _gl$2 = new WeakMap(), _geometry = new WeakMap();

    var _geometry$1, _gl$3, _instanceExtension;
    class InstancedMesh extends Mesh {
        constructor(gl, { geometry, uniforms, defines, instanceCount = 1, vertexShaderSource, fragmentShaderSource, }) {
            super(gl, {
                geometry,
                uniforms,
                defines,
                vertexShaderSource,
                fragmentShaderSource,
            });
            _geometry$1.set(this, void 0);
            _gl$3.set(this, void 0);
            _instanceExtension.set(this, void 0);
            __classPrivateFieldSet(this, _gl$3, gl);
            __classPrivateFieldSet(this, _geometry$1, geometry);
            __classPrivateFieldSet(this, _instanceExtension, getExtension(gl, 'ANGLE_instanced_arrays'));
            this.instanceCount = instanceCount;
            // assign divisors to instanced attributes
            this.vaoExtension.bindVertexArrayOES(this.vao);
            geometry.attributes.forEach(({ instancedDivisor }, key) => {
                if (instancedDivisor) {
                    const location = this.program.getAttribLocation(key);
                    if (location === -1) {
                        return;
                    }
                    __classPrivateFieldGet(this, _instanceExtension).vertexAttribDivisorANGLE(location, instancedDivisor);
                }
            });
            // initialize instance instanceModelMatrix attribute as identity matrix
            const instanceMatrixLocation = this.program.getAttribLocation(INSTANCED_OFFSET_MODEL_MATRIX);
            if (instanceMatrixLocation == null || instanceMatrixLocation === -1) {
                console.error(`Can't query "${INSTANCED_OFFSET_MODEL_MATRIX}" mandatory instanced attribute`);
                return this;
            }
            const identityMat = create();
            const itemsPerInstance = 16;
            const bytesPerMatrix = itemsPerInstance * Float32Array.BYTES_PER_ELEMENT;
            const matrixData = new Float32Array(itemsPerInstance * instanceCount);
            for (let i = 0; i < instanceCount; i++) {
                for (let n = i * itemsPerInstance, j = 0; n < i * itemsPerInstance + itemsPerInstance; n++) {
                    matrixData[n] = identityMat[j];
                    j++;
                }
            }
            const matrixBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, matrixData, gl.DYNAMIC_DRAW);
            for (let i = 0; i < 4; i++) {
                const location = instanceMatrixLocation + i;
                gl.enableVertexAttribArray(location);
                const offset = i * itemsPerInstance;
                gl.vertexAttribPointer(location, 4, gl.FLOAT, false, bytesPerMatrix, offset);
                __classPrivateFieldGet(this, _instanceExtension).vertexAttribDivisorANGLE(location, 1);
            }
            this.vaoExtension.bindVertexArrayOES(null);
            __classPrivateFieldGet(this, _geometry$1).attributes.set(INSTANCED_OFFSET_MODEL_MATRIX, {
                location: instanceMatrixLocation,
                typedArray: matrixData,
                buffer: matrixBuffer,
                size: 4,
                stride: 4 * itemsPerInstance,
                instancedDivisor: 1,
            });
        }
        /**
         * @param {number} index - Instance index on which to apply the matrix
         * @param {Float32Array|Float64Array} matrix - Matrix to control the instance scale, rotation and translation
         */
        setMatrixAt(index, matrix) {
            const itemsPerInstance = 16;
            this.updateGeometryAttribute(INSTANCED_OFFSET_MODEL_MATRIX, index, itemsPerInstance, matrix);
            return this;
        }
        /**
         * Draws the instanced mesh
         */
        draw() {
            if (this.shouldUpdate) {
                super.updateModelMatrix();
                this.program.setUniform(MODEL_MATRIX_UNIFORM_NAME, UNIFORM_TYPE_MATRIX4X4, this.modelMatrix);
            }
            this.program.bind();
            this.vaoExtension.bindVertexArrayOES(this.vao);
            if (this.hasIndices) {
                __classPrivateFieldGet(this, _instanceExtension).drawElementsInstancedANGLE(this.drawMode, __classPrivateFieldGet(this, _geometry$1).vertexCount, __classPrivateFieldGet(this, _gl$3).UNSIGNED_SHORT, 0, this.instanceCount);
            }
            else {
                __classPrivateFieldGet(this, _instanceExtension).drawArraysInstancedANGLE(this.drawMode, 0, __classPrivateFieldGet(this, _geometry$1).vertexCount, this.instanceCount);
            }
            this.vaoExtension.bindVertexArrayOES(null);
            return this;
        }
    }
    _geometry$1 = new WeakMap(), _gl$3 = new WeakMap(), _instanceExtension = new WeakMap();

    /**
     * Clamp number to a given range
     * @param {number} num
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
    /**
     *
     * @param {number} val
     * @param {number} inMin
     * @param {number} inMax
     * @param {number} outMin
     * @param {number} outMax
     * @returns {number}
     */
    const mapNumberRange = (val, inMin, inMax, outMin, outMax) => {
        return ((val - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    };
    /**
     * Check if number is power of 2
     * @param {number} value
     * @returns {number}
     */
    const isPowerOf2 = (value) => (value & (value - 1)) === 0;
    /**
     * Normalizes a number
     * @param {number} min
     * @param {number} max
     * @param {number} val
     * @returns {number}
     */
    const normalizeNumber = (min, max, val) => (val - min) / (max - min);
    /**
     *
     * @param {number} t
     * @returns {number}
     */
    const triangleWave = (t) => {
        t -= Math.floor(t * 0.5) * 2;
        t = Math.min(Math.max(t, 0), 2);
        return 1 - Math.abs(t - 1);
    };

    /**
     * Texture class used to store image, video, canvas and data as typed arrays
     * @public
     */
    class Texture {
        constructor(gl, { format = gl.RGB, internalFormat = format, type = gl.UNSIGNED_BYTE, unpackAlignment = 1, wrapS = gl.CLAMP_TO_EDGE, wrapT = gl.CLAMP_TO_EDGE, minFilter = gl.LINEAR, magFilter = gl.LINEAR, target = gl.TEXTURE_2D, } = {}) {
            this.gl = gl;
            this.format = format;
            this.internalFormat = internalFormat;
            this.type = type;
            this.target = target;
            this.texture = gl.createTexture();
            this.bind()
                .setPixelStore(gl.UNPACK_ALIGNMENT, unpackAlignment)
                .setMinFilter(minFilter)
                .setMagFilter(magFilter)
                .setWrap(wrapS, wrapT)
                .unbind();
            this.anisotropyExtension =
                getExtension(gl, 'EXT_texture_filter_anisotropic') ||
                    getExtension(gl, 'MOZ_EXT_texture_filter_anisotropic') ||
                    getExtension(gl, 'WEBKIT_EXT_texture_filter_anisotropic');
        }
        /**
         * @returns {WebGLTexture|null}
         */
        getTexture() {
            return this.texture;
        }
        /**
         * Binds the texture to the target
         * @returns {this}
         */
        bind() {
            this.gl.bindTexture(this.target, this.texture);
            return this;
        }
        /**
         * Unbinds the texture
         * @returns {this}
         */
        unbind() {
            this.gl.bindTexture(this.target, null);
            return this;
        }
        /**
         * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} image
         * @param {number} [width]
         * @param {number} [height
         * @returns {this}
         */
        fromImage(image, width = image.width, height = image.height) {
            this.width = width;
            this.height = height;
            this.gl.texImage2D(this.target, 0, this.internalFormat, this.format, this.type, image);
            return this;
        }
        /**
         * @param {number} width
         * @param {number} height
         * @returns {this}
         */
        fromSize(width, height) {
            if (!width || !height) {
                console.warn('Incomplete dimensions for creating empty texture');
            }
            this.width = width;
            this.height = height;
            this.gl.texImage2D(this.target, 0, this.internalFormat, this.width, this.height, 0, this.format, this.type, null);
            return this;
        }
        /**
         * @param dataArray
         * @param {number} [width]
         * @param {number} [height]
         * @returns {this}
         */
        fromData(dataArray, width, height) {
            if (!width || !height) {
                console.warn('Incomplete dimensions for creating texture from data array');
            }
            this.width = width;
            this.height = height;
            this.gl.texImage2D(this.target, 0, this.internalFormat, this.width, this.height, 0, this.format, this.type, dataArray);
            return this;
        }
        /**
         * @returns {this}
         */
        generateMipmap() {
            this.gl.generateMipmap(this.target);
            return this;
        }
        /**
         * @param {GLEnum} [format = gl.RGB]
         * @param {GLEnum} [internalFormat = gl.RGB]
         * @param {GLenum} [type = gl.UNSIGNED_BYTE]
         * @returns {this}
         */
        setFormat(format = this.gl.RGB, internalFormat = this.gl.RGB, type = this.gl.UNSIGNED_BYTE) {
            this.format = format;
            this.internalFormat = internalFormat;
            this.type = type;
            return this;
        }
        /**
         * @returns {this}
         */
        setIsFlip(flip = 1) {
            this.setPixelStore(this.gl.UNPACK_FLIP_Y_WEBGL, flip);
            return this;
        }
        /**
         * @param {GLenum} name
         * @param params
         * @returns {this}
         */
        setPixelStore(name, params) {
            this.gl.pixelStorei(name, params);
            return this;
        }
        /**
         * @param {GLenum} [filter = gl.LINEAR]
         * @returns {this}
         */
        setMinFilter(filter = this.gl.LINEAR) {
            this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, filter);
            return this;
        }
        /**
         * @param {GLenum} [filter = gl.LINEAR]
         * @returns {this}
         */
        setMagFilter(filter = this.gl.LINEAR) {
            this.gl.texParameteri(this.target, this.gl.TEXTURE_MAG_FILTER, filter);
            return this;
        }
        /**
         *
         * @param {GLenum} [wrapS = gl.CLAMP_TO_EDGE]
         * @param {GLenum} [wrapT = gl.CLAMP_TO_EDGE]
         * @returns {this}
         */
        setWrap(wrapS = this.gl.CLAMP_TO_EDGE, wrapT = this.gl.CLAMP_TO_EDGE) {
            this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_S, wrapS);
            this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_T, wrapT);
            return this;
        }
        /**
         *
         * @param {number} anisotropyLevel
         * @returns {this}
         */
        setAnisotropy(anisotropyLevel) {
            if (!anisotropyLevel) {
                return this;
            }
            if (this.anisotropyExtension) {
                const maxAnisotropySupported = this.gl.getParameter(this.anisotropyExtension.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
                this.gl.texParameterf(this.target, this.anisotropyExtension.TEXTURE_MAX_ANISOTROPY_EXT, anisotropyLevel || maxAnisotropySupported);
            }
            else {
                console.warn('EXT_texture_filter_anisotropic extension is not supported');
            }
            return this;
        }
        delete() {
            this.gl.deleteTexture(this.texture);
        }
    }
    Texture.isPowerOf2 = (width, height) => isPowerOf2(width) && isPowerOf2(height);

    var _targets;
    class CubeTexture extends Texture {
        constructor(gl, { format = gl.RGB, internalFormat = format, type = gl.UNSIGNED_BYTE, unpackAlignment = 1, wrapS = gl.CLAMP_TO_EDGE, wrapT = gl.CLAMP_TO_EDGE, minFilter = gl.LINEAR, magFilter = gl.LINEAR, } = {}) {
            super(gl, {
                format,
                internalFormat,
                type,
                unpackAlignment,
                wrapS,
                wrapT,
                minFilter,
                magFilter,
                target: gl.TEXTURE_CUBE_MAP,
            });
            _targets.set(this, [
                this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            ]);
        }
        /**
         *
         * @param {Array.<HTMLImageElement | HTMLCanvasElement>} sidesImages
         * @returns {this}
         */
        addSides(sidesImages) {
            const gl = this.gl;
            sidesImages.forEach((image, i) => {
                const target = __classPrivateFieldGet(this, _targets)[i];
                const level = 0;
                gl.texImage2D(target, level, this.internalFormat, this.format, this.type, image);
            });
            return this;
        }
    }
    _targets = new WeakMap();

    var _gl$4, _buffer, _depthBuffer, _width, _height, _depth, _useDepthRenderBuffer;
    class Framebuffer {
        constructor(gl, params = {}) {
            _gl$4.set(this, void 0);
            _buffer.set(this, void 0);
            _depthBuffer.set(this, void 0);
            _width.set(this, void 0);
            _height.set(this, void 0);
            _depth.set(this, void 0);
            _useDepthRenderBuffer.set(this, void 0);
            const { inputTexture, width = gl.canvas.width, height = gl.canvas.height, wrapS = gl.CLAMP_TO_EDGE, wrapT = gl.CLAMP_TO_EDGE, minFilter = gl.NEAREST, magFilter = gl.NEAREST, format = gl.RGBA, internalFormat = format, type = gl.UNSIGNED_BYTE, depth = true, useDepthRenderBuffer = true, } = params;
            __classPrivateFieldSet(this, _gl$4, gl);
            __classPrivateFieldSet(this, _width, width);
            __classPrivateFieldSet(this, _height, height);
            __classPrivateFieldSet(this, _depth, depth);
            __classPrivateFieldSet(this, _useDepthRenderBuffer, useDepthRenderBuffer);
            if (inputTexture) {
                this.texture = inputTexture;
            }
            else {
                this.texture = new Texture(gl, {
                    type,
                    format,
                    internalFormat,
                    wrapS,
                    wrapT,
                    minFilter,
                    magFilter,
                })
                    .bind()
                    .fromSize(width, height);
            }
            __classPrivateFieldSet(this, _buffer, gl.createFramebuffer());
            this.updateWithSize(__classPrivateFieldGet(this, _width), __classPrivateFieldGet(this, _height));
        }
        bind() {
            __classPrivateFieldGet(this, _gl$4).bindFramebuffer(__classPrivateFieldGet(this, _gl$4).FRAMEBUFFER, __classPrivateFieldGet(this, _buffer));
            return this;
        }
        unbind() {
            __classPrivateFieldGet(this, _gl$4).bindFramebuffer(__classPrivateFieldGet(this, _gl$4).FRAMEBUFFER, null);
            return this;
        }
        updateWithSize(width, height, updateTexture = false) {
            this.bind();
            const level = 0;
            const texture = this.texture.getTexture();
            __classPrivateFieldGet(this, _gl$4).framebufferTexture2D(__classPrivateFieldGet(this, _gl$4).FRAMEBUFFER, __classPrivateFieldGet(this, _gl$4).COLOR_ATTACHMENT0, __classPrivateFieldGet(this, _gl$4).TEXTURE_2D, texture, level);
            if (__classPrivateFieldGet(this, _depth)) {
                if (__classPrivateFieldGet(this, _useDepthRenderBuffer)) {
                    __classPrivateFieldSet(this, _depthBuffer, __classPrivateFieldGet(this, _gl$4).createRenderbuffer());
                    __classPrivateFieldGet(this, _gl$4).bindRenderbuffer(__classPrivateFieldGet(this, _gl$4).RENDERBUFFER, __classPrivateFieldGet(this, _depthBuffer));
                    __classPrivateFieldGet(this, _gl$4).renderbufferStorage(__classPrivateFieldGet(this, _gl$4).RENDERBUFFER, __classPrivateFieldGet(this, _gl$4).DEPTH_COMPONENT16, width, height);
                    __classPrivateFieldGet(this, _gl$4).framebufferRenderbuffer(__classPrivateFieldGet(this, _gl$4).FRAMEBUFFER, __classPrivateFieldGet(this, _gl$4).DEPTH_ATTACHMENT, __classPrivateFieldGet(this, _gl$4).RENDERBUFFER, __classPrivateFieldGet(this, _depthBuffer));
                    __classPrivateFieldGet(this, _gl$4).bindRenderbuffer(__classPrivateFieldGet(this, _gl$4).RENDERBUFFER, null);
                }
                else {
                    const depthTextureExt = getExtension(__classPrivateFieldGet(this, _gl$4), 'WEBGL_depth_texture');
                    if (!depthTextureExt) {
                        console.error('Missing extension WEBGL_depth_texture');
                    }
                    this.depthTexture = new Texture(__classPrivateFieldGet(this, _gl$4), {
                        format: __classPrivateFieldGet(this, _gl$4).DEPTH_COMPONENT,
                        type: __classPrivateFieldGet(this, _gl$4).UNSIGNED_INT,
                        minFilter: __classPrivateFieldGet(this, _gl$4).LINEAR,
                        magFilter: __classPrivateFieldGet(this, _gl$4).LINEAR,
                    })
                        .bind()
                        .fromSize(__classPrivateFieldGet(this, _width), __classPrivateFieldGet(this, _height));
                    __classPrivateFieldGet(this, _gl$4).framebufferTexture2D(__classPrivateFieldGet(this, _gl$4).FRAMEBUFFER, __classPrivateFieldGet(this, _gl$4).DEPTH_ATTACHMENT, __classPrivateFieldGet(this, _gl$4).TEXTURE_2D, this.depthTexture.getTexture(), 0);
                }
            }
            this.unbind();
            if (updateTexture) {
                this.texture.bind().fromSize(width, height);
            }
            __classPrivateFieldSet(this, _width, width);
            __classPrivateFieldSet(this, _height, height);
            return this;
        }
        reset() {
            this.texture
                .bind()
                .fromSize(__classPrivateFieldGet(this, _width), __classPrivateFieldGet(this, _height))
                .unbind();
            return this;
        }
        delete() {
            this.texture.delete();
            if (this.depthTexture) {
                this.depthTexture.delete();
            }
            __classPrivateFieldGet(this, _gl$4).deleteFramebuffer(__classPrivateFieldGet(this, _buffer));
        }
    }
    _gl$4 = new WeakMap(), _buffer = new WeakMap(), _depthBuffer = new WeakMap(), _width = new WeakMap(), _height = new WeakMap(), _depth = new WeakMap(), _useDepthRenderBuffer = new WeakMap();

    class DampedAction {
        constructor() {
            this.value = 0.0;
            this.damping = 0.5;
        }
        addForce(force) {
            this.value += force;
        }
        /** updates the damping and calls {@link damped-callback}. */
        update() {
            const isActive = this.value * this.value > 0.000001;
            if (isActive) {
                this.value *= this.damping;
            }
            else {
                this.stop();
            }
            return this.value;
        }
        /** stops the damping. */
        stop() {
            this.value = 0.0;
        }
    }
    class CameraController {
        constructor(camera, domElement = document.body, isDebug = false) {
            this.target = create$1();
            this.minDistance = 0;
            this.maxDistance = Infinity;
            this.isEnabled = true;
            this.targetXDampedAction = new DampedAction();
            this.targetYDampedAction = new DampedAction();
            this.targetZDampedAction = new DampedAction();
            this.targetThetaDampedAction = new DampedAction();
            this.targetPhiDampedAction = new DampedAction();
            this.targetRadiusDampedAction = new DampedAction();
            this._isShiftDown = false;
            this._rotateStart = {
                x: 9999,
                y: 9999,
            };
            this._rotateEnd = {
                x: 9999,
                y: 9999,
            };
            this._roatteDelta = {
                x: 9999,
                y: 9999,
            };
            this._zoomDistanceEnd = 0;
            this._zoomDistance = 0;
            this.state = '';
            this.loopId = 0;
            this._panStart = { x: 0, y: 0 };
            this._panDelta = { x: 0, y: 0 };
            this._panEnd = { x: 0, y: 0 };
            this._paused = false;
            this._isDebug = false;
            if (!camera) {
                console.error('camera is undefined');
            }
            this.camera = camera;
            this.domElement = domElement;
            // Set to true to enable damping (inertia)
            // If damping is enabled, you must call controls.update() in your animation loop
            this.isDamping = false;
            this.dampingFactor = 0.25;
            // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
            // Set to false to disable zooming
            this.isZoom = true;
            this.zoomSpeed = 1.0;
            // Set to false to disable rotating
            this.isRotate = true;
            this.rotateSpeed = 1.0;
            // Set to false to disable panning
            this.isPan = true;
            this.keyPanSpeed = 7.0; // pixels moved per arrow key push
            // Set to false to disable use of the keys
            this.enableKeys = true;
            // The four arrow keys
            this.keys = {
                LEFT: '37',
                UP: '38',
                RIGHT: '39',
                BOTTOM: '40',
                SHIFT: '16',
            };
            // for reset
            this.originTarget = create$1();
            this.originPosition = create$1();
            this.originPosition[0] = camera.position[0];
            this.originPosition[1] = camera.position[0];
            this.originPosition[2] = camera.position[0];
            const dX = this.camera.position[0];
            const dY = this.camera.position[1];
            const dZ = this.camera.position[2];
            const radius = Math.sqrt(dX * dX + dY * dY + dZ * dZ);
            const theta = Math.atan2(this.camera.position[0], this.camera.position[2]); // equator angle around y-up axis
            const phi = Math.acos(clamp(this.camera.position[1] / radius, -1, 1)); // polar angle
            this._spherical = {
                radius: radius,
                theta: theta,
                phi: phi,
            };
            this._bindEvens();
            this.setEventHandler();
            this.startTick();
            this._isDebug = isDebug;
            if (isDebug) {
                this._outputEl = document.createElement('div');
                this._outputEl.setAttribute('style', `
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 999;
      font-family: monospace;
      font-size: 14px;
      user-select: none;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 4px;
      padding: 3px 6px;
    `);
                document.body.appendChild(this._outputEl);
            }
        }
        setEventHandler() {
            this.domElement.addEventListener('contextmenu', this._contextMenuHandler, false);
            this.domElement.addEventListener('mousedown', this._mouseDownHandler, false);
            this.domElement.addEventListener('wheel', this._mouseWheelHandler, false);
            this.domElement.addEventListener('touchstart', this._touchStartHandler, false);
            this.domElement.addEventListener('touchmove', this._touchMoveHandler, false);
            window.addEventListener('keydown', this._onKeyDownHandler, false);
            window.addEventListener('keyup', this._onKeyUpHandler, false);
        }
        removeEventHandler() {
            this.domElement.removeEventListener('contextmenu', this._contextMenuHandler, false);
            this.domElement.removeEventListener('mousedown', this._mouseDownHandler, false);
            this.domElement.removeEventListener('wheel', this._mouseWheelHandler, false);
            this.domElement.removeEventListener('mousemove', this._mouseMoveHandler, false);
            window.removeEventListener('mouseup', this._mouseUpHandler, false);
            this.domElement.removeEventListener('touchstart', this._touchStartHandler, false);
            this.domElement.removeEventListener('touchmove', this._touchMoveHandler, false);
            window.removeEventListener('keydown', this._onKeyDownHandler, false);
            window.removeEventListener('keydown', this._onKeyUpHandler, false);
        }
        startTick() {
            this.loopId = requestAnimationFrame(this.tick);
        }
        pause() {
            this._paused = true;
        }
        start() {
            this._paused = false;
        }
        tick() {
            if (!this._paused) {
                this.updateDampedAction();
                this.updateCamera();
                if (this._isDebug) {
                    const cameraX = Math.round(this.camera.position[0] * 100) / 100;
                    const cameraY = Math.round(this.camera.position[1] * 100) / 100;
                    const cameraZ = Math.round(this.camera.position[2] * 100) / 100;
                    this._outputEl.textContent = `x: ${cameraX} y: ${cameraY} z: ${cameraZ}`;
                }
            }
            this.loopId = requestAnimationFrame(this.tick);
        }
        updateDampedAction() {
            this.target[0] += this.targetXDampedAction.update();
            this.target[1] += this.targetYDampedAction.update();
            this.target[2] += this.targetZDampedAction.update();
            this._spherical.theta += this.targetThetaDampedAction.update();
            this._spherical.phi += this.targetPhiDampedAction.update();
            this._spherical.radius += this.targetRadiusDampedAction.update();
        }
        updateCamera() {
            const s = this._spherical;
            const sinPhiRadius = Math.sin(s.phi) * s.radius;
            this.camera.position[0] = sinPhiRadius * Math.sin(s.theta) + this.target[0];
            this.camera.position[1] = Math.cos(s.phi) * s.radius + this.target[1];
            this.camera.position[2] = sinPhiRadius * Math.cos(s.theta) + this.target[2];
            // console.log(this.camera.position);
            // console.log(this.target);
            this.camera.lookAtPosition[0] = this.target[0];
            this.camera.lookAtPosition[1] = this.target[1];
            this.camera.lookAtPosition[2] = this.target[2];
            this.camera.updateViewMatrix();
        }
        _bindEvens() {
            this.tick = this.tick.bind(this);
            this._contextMenuHandler = this._contextMenuHandler.bind(this);
            this._mouseDownHandler = this._mouseDownHandler.bind(this);
            this._mouseWheelHandler = this._mouseWheelHandler.bind(this);
            this._mouseMoveHandler = this._mouseMoveHandler.bind(this);
            this._mouseUpHandler = this._mouseUpHandler.bind(this);
            this._touchStartHandler = this._touchStartHandler.bind(this);
            this._touchMoveHandler = this._touchMoveHandler.bind(this);
            this._onKeyDownHandler = this._onKeyDownHandler.bind(this);
            this._onKeyUpHandler = this._onKeyUpHandler.bind(this);
        }
        _contextMenuHandler(event) {
            if (!this.isEnabled)
                return;
            event.preventDefault();
        }
        _mouseDownHandler(event) {
            if (!this.isEnabled)
                return;
            if (event.button === 0) {
                this.state = 'rotate';
                this._rotateStart = {
                    x: event.clientX,
                    y: event.clientY,
                };
            }
            else {
                this.state = 'pan';
                this._panStart = {
                    x: event.clientX,
                    y: event.clientY,
                };
            }
            this.domElement.addEventListener('mousemove', this._mouseMoveHandler, false);
            window.addEventListener('mouseup', this._mouseUpHandler, false);
        }
        _mouseUpHandler() {
            this.domElement.removeEventListener('mousemove', this._mouseMoveHandler, false);
            window.removeEventListener('mouseup', this._mouseUpHandler, false);
        }
        _mouseMoveHandler(event) {
            if (!this.isEnabled)
                return;
            if (this.state === 'rotate') {
                this._rotateEnd = {
                    x: event.clientX,
                    y: event.clientY,
                };
                this._roatteDelta = {
                    x: this._rotateEnd.x - this._rotateStart.x,
                    y: this._rotateEnd.y - this._rotateStart.y,
                };
                this._updateRotateHandler();
                this._rotateStart = {
                    x: this._rotateEnd.x,
                    y: this._rotateEnd.y,
                };
            }
            else if (this.state === 'pan') {
                this._panEnd = {
                    x: event.clientX,
                    y: event.clientY,
                };
                this._panDelta = {
                    x: -0.5 * (this._panEnd.x - this._panStart.x),
                    y: 0.5 * (this._panEnd.y - this._panStart.y),
                };
                this._updatePanHandler();
                this._panStart = {
                    x: this._panEnd.x,
                    y: this._panEnd.y,
                };
            }
            // this.update();
        }
        _mouseWheelHandler(event) {
            if (event.deltaY > 0) {
                this.targetRadiusDampedAction.addForce(1);
            }
            else {
                this.targetRadiusDampedAction.addForce(-1);
            }
        }
        _touchStartHandler(event) {
            let dX;
            let dY;
            switch (event.touches.length) {
                case 1:
                    this.state = 'rotate';
                    this._rotateStart = {
                        x: event.touches[0].clientX,
                        y: event.touches[0].clientY,
                    };
                    break;
                case 2:
                    this.state = 'zoom';
                    dX = event.touches[1].clientX - event.touches[0].clientX;
                    dY = event.touches[1].clientY - event.touches[0].clientY;
                    this._zoomDistance = Math.sqrt(dX * dX + dY * dY);
                    break;
                case 3:
                    this.state = 'pan';
                    this._panStart = {
                        x: (event.touches[0].clientX +
                            event.touches[1].clientX +
                            event.touches[2].clientX) /
                            3,
                        y: (event.touches[0].clientY +
                            event.touches[1].clientY +
                            event.touches[2].clientY) /
                            3,
                    };
                    break;
            }
        }
        _touchMoveHandler(event) {
            let dX;
            let dY;
            let dDis;
            event.preventDefault();
            switch (event.touches.length) {
                case 1:
                    if (this.state !== 'rotate')
                        return;
                    this._rotateEnd = {
                        x: event.touches[0].clientX,
                        y: event.touches[0].clientY,
                    };
                    this._roatteDelta = {
                        x: (this._rotateEnd.x - this._rotateStart.x) * 0.5,
                        y: (this._rotateEnd.y - this._rotateStart.y) * 0.5,
                    };
                    this._updateRotateHandler();
                    this._rotateStart = {
                        x: this._rotateEnd.x,
                        y: this._rotateEnd.y,
                    };
                    break;
                case 2:
                    if (this.state !== 'zoom')
                        return;
                    dX = event.touches[1].clientX - event.touches[0].clientX;
                    dY = event.touches[1].clientY - event.touches[0].clientY;
                    this._zoomDistanceEnd = Math.sqrt(dX * dX + dY * dY);
                    dDis = this._zoomDistanceEnd - this._zoomDistance;
                    dDis *= 1.5;
                    // eslint-disable-next-line no-case-declarations
                    let targetRadius = this._spherical.radius - dDis;
                    targetRadius = clamp(targetRadius, this.minDistance, this.maxDistance);
                    this._zoomDistance = this._zoomDistanceEnd;
                    this._spherical.radius = targetRadius;
                    break;
                case 3:
                    this._panEnd = {
                        x: (event.touches[0].clientX +
                            event.touches[1].clientX +
                            event.touches[2].clientX) /
                            3,
                        y: (event.touches[0].clientY +
                            event.touches[1].clientY +
                            event.touches[2].clientY) /
                            3,
                    };
                    this._panDelta = {
                        x: this._panEnd.x - this._panStart.x,
                        y: this._panEnd.y - this._panStart.y,
                    };
                    this._panDelta.x *= -1;
                    this._updatePanHandler();
                    this._panStart = {
                        x: this._panEnd.x,
                        y: this._panEnd.y,
                    };
                    break;
            }
            // this.update();
        }
        _onKeyDownHandler(event) {
            let dX = 0;
            let dY = 0;
            switch (event.key) {
                case this.keys.SHIFT:
                    this._isShiftDown = true;
                    break;
                case this.keys.LEFT:
                    dX = -10;
                    break;
                case this.keys.RIGHT:
                    dX = 10;
                    break;
                case this.keys.UP:
                    dY = 10;
                    break;
                case this.keys.BOTTOM:
                    dY = -10;
                    break;
            }
            if (!this._isShiftDown) {
                this._panDelta = {
                    x: dX,
                    y: dY,
                };
                this._updatePanHandler();
            }
            else {
                this._roatteDelta = {
                    x: -dX,
                    y: dY,
                };
                this._updateRotateHandler();
            }
        }
        _onKeyUpHandler(event) {
            switch (event.key) {
                case this.keys.SHIFT:
                    this._isShiftDown = false;
                    break;
            }
        }
        _updatePanHandler() {
            const xDir = create$1();
            const yDir = create$1();
            const zDir = create$1();
            zDir[0] = this.target[0] - this.camera.position[0];
            zDir[1] = this.target[1] - this.camera.position[1];
            zDir[2] = this.target[2] - this.camera.position[2];
            normalize(zDir, zDir);
            cross(xDir, zDir, [0, 1, 0]);
            cross(yDir, xDir, zDir);
            const scale = Math.max(this._spherical.radius / 2000, 0.001);
            this.targetXDampedAction.addForce((xDir[0] * this._panDelta.x + yDir[0] * this._panDelta.y) * scale);
            this.targetYDampedAction.addForce((xDir[1] * this._panDelta.x + yDir[1] * this._panDelta.y) * scale);
            this.targetZDampedAction.addForce((xDir[2] * this._panDelta.x + yDir[2] * this._panDelta.y) * scale);
        }
        _updateRotateHandler() {
            this.targetThetaDampedAction.addForce(-this._roatteDelta.x / this.domElement.clientWidth);
            this.targetPhiDampedAction.addForce(-this._roatteDelta.y / this.domElement.clientHeight);
        }
    }

    class PerspectiveCamera {
        constructor(fieldOfView, aspect, near, far) {
            this.position = [0, 0, 0];
            this.lookAtPosition = [0, 0, 0];
            this.projectionMatrix = create();
            this.viewMatrix = create();
            this.zoom = 1;
            this.fieldOfView = fieldOfView;
            this.aspect = aspect;
            this.near = near;
            this.far = far;
            this.updateProjectionMatrix();
        }
        updateViewMatrix() {
            lookAt(this.viewMatrix, this.position, this.lookAtPosition, PerspectiveCamera.UP_VECTOR);
            return this;
        }
        updateProjectionMatrix() {
            perspective(this.projectionMatrix, this.fieldOfView, this.aspect, this.near, this.far);
            return this;
        }
        lookAt(target) {
            this.lookAtPosition = target;
            this.updateViewMatrix();
            return this;
        }
    }
    PerspectiveCamera.UP_VECTOR = [0, 1, 0];

    class OrthographicCamera {
        constructor(left, right, top, bottom, near, far) {
            this.left = -1;
            this.right = 1;
            this.top = 1;
            this.bottom = -1;
            this.near = 0.1;
            this.far = 2000;
            this.zoom = 1;
            this.position = [0, 0, 0];
            this.lookAtPosition = [0, 0, 0];
            this.projectionMatrix = create();
            this.viewMatrix = create();
            this.left = left;
            this.right = right;
            this.top = top;
            this.bottom = bottom;
            this.near = near;
            this.far = far;
            this.updateProjectionMatrix();
        }
        updateViewMatrix() {
            lookAt(this.viewMatrix, this.position, this.lookAtPosition, OrthographicCamera.UP_VECTOR);
            return this;
        }
        updateProjectionMatrix() {
            ortho(this.projectionMatrix, this.left, this.right, this.bottom, this.top, this.near, this.far);
            return this;
        }
        lookAt(target) {
            this.lookAtPosition = target;
            this.updateViewMatrix();
            return this;
        }
    }
    OrthographicCamera.UP_VECTOR = [0, 1, 0];

    /**
     * @private
     */
    function buildPlane(vertices, normal, uv, indices, width, height, depth, wSegs, hSegs, u = 0, v = 1, w = 2, uDir = 1, vDir = -1, i = 0, ii = 0) {
        const io = i;
        const segW = width / wSegs;
        const segH = height / hSegs;
        for (let iy = 0; iy <= hSegs; iy++) {
            const y = iy * segH - height / 2;
            for (let ix = 0; ix <= wSegs; ix++, i++) {
                const x = ix * segW - width / 2;
                vertices[i * 3 + u] = x * uDir;
                vertices[i * 3 + v] = y * vDir;
                vertices[i * 3 + w] = depth / 2;
                normal[i * 3 + u] = 0;
                normal[i * 3 + v] = 0;
                normal[i * 3 + w] = depth >= 0 ? 1 : -1;
                uv[i * 2] = ix / wSegs;
                uv[i * 2 + 1] = 1 - iy / hSegs;
                if (iy === hSegs || ix === wSegs)
                    continue;
                const a = io + ix + iy * (wSegs + 1);
                const b = io + ix + (iy + 1) * (wSegs + 1);
                const c = io + ix + (iy + 1) * (wSegs + 1) + 1;
                const d = io + ix + iy * (wSegs + 1) + 1;
                indices[ii * 6] = a;
                indices[ii * 6 + 1] = b;
                indices[ii * 6 + 2] = d;
                indices[ii * 6 + 3] = b;
                indices[ii * 6 + 4] = c;
                indices[ii * 6 + 5] = d;
                ii++;
            }
        }
    }

    /**
     * Generates geometry data for a box
     * @param {Box} params
     * @returns {{ vertices, normal, uv, indices }}
     */
    function createBox(params = {}) {
        const { width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1, } = params;
        const wSegs = widthSegments;
        const hSegs = heightSegments;
        const dSegs = depthSegments;
        const num = (wSegs + 1) * (hSegs + 1) * 2 +
            (wSegs + 1) * (dSegs + 1) * 2 +
            (hSegs + 1) * (dSegs + 1) * 2;
        const numIndices = (wSegs * hSegs * 2 + wSegs * dSegs * 2 + hSegs * dSegs * 2) * 6;
        const vertices = new Float32Array(num * 3);
        const normal = new Float32Array(num * 3);
        const uv = new Float32Array(num * 2);
        const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
        let i = 0;
        let ii = 0;
        {
            // RIGHT
            buildPlane(vertices, normal, uv, indices, depth, height, width, dSegs, hSegs, 2, 1, 0, -1, -1, i, ii);
        }
        {
            // LEFT
            buildPlane(vertices, normal, uv, indices, depth, height, -width, dSegs, hSegs, 2, 1, 0, 1, -1, (i += (dSegs + 1) * (hSegs + 1)), (ii += dSegs * hSegs));
        }
        {
            // TOP
            buildPlane(vertices, normal, uv, indices, width, depth, height, dSegs, hSegs, 0, 2, 1, 1, 1, (i += (dSegs + 1) * (hSegs + 1)), (ii += dSegs * hSegs));
        }
        {
            // BOTTOM
            buildPlane(vertices, normal, uv, indices, width, depth, -height, dSegs, hSegs, 0, 2, 1, 1, -1, (i += (wSegs + 1) * (dSegs + 1)), (ii += wSegs * dSegs));
        }
        {
            // BACK
            buildPlane(vertices, normal, uv, indices, width, height, -depth, wSegs, hSegs, 0, 1, 2, -1, -1, (i += (wSegs + 1) * (dSegs + 1)), (ii += wSegs * dSegs));
        }
        {
            // FRONT
            buildPlane(vertices, normal, uv, indices, width, height, depth, wSegs, hSegs, 0, 1, 2, 1, -1, (i += (wSegs + 1) * (hSegs + 1)), (ii += wSegs * hSegs));
        }
        return {
            vertices,
            normal,
            uv,
            indices,
        };
    }

    /**
     * Generates geometry data for a box
     * @param {Box} params
     * @returns {[{ vertices, normal, uv, indices, orientation }]}
     */
    function createBoxSeparateFace(params = {}) {
        const { width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1, } = params;
        const wSegs = widthSegments;
        const hSegs = heightSegments;
        const dSegs = depthSegments;
        const sidesData = [];
        const i = 0;
        const ii = 0;
        {
            // RIGHT
            const num = (dSegs + 1) * (hSegs + 1);
            const numIndices = dSegs * hSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, depth, height, width, dSegs, hSegs, 2, 1, 0, -1, -1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_RIGHT,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        {
            // LEFT
            const num = (dSegs + 1) * (hSegs + 1);
            const numIndices = dSegs * hSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, depth, height, -width, dSegs, hSegs, 2, 1, 0, 1, -1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_LEFT,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        {
            // TOP
            const num = (dSegs + 1) * (hSegs + 1);
            const numIndices = dSegs * hSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, width, depth, height, dSegs, hSegs, 0, 2, 1, 1, 1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_TOP,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        {
            // BOTTOM
            const num = (dSegs + 1) * (hSegs + 1);
            const numIndices = dSegs * hSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, width, depth, -height, dSegs, hSegs, 0, 2, 1, 1, -1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_BOTTOM,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        {
            // BACK
            const num = (wSegs + 1) * (dSegs + 1);
            const numIndices = wSegs * dSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, width, height, -depth, wSegs, hSegs, 0, 1, 2, -1, -1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_BACK,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        {
            // FRONT
            const num = (wSegs + 1) * (hSegs + 1);
            const numIndices = wSegs * hSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, width, height, depth, wSegs, hSegs, 0, 1, 2, 1, -1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_FRONT,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        return sidesData;
    }

    // @ts-nocheck
    // Handle Simple 90 Degree Rotations without the use of Quat,Trig,Matrices
    class VRot90 {
        // #region SINGLE AXIS ROTATION
        static xp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = x;
            o[1] = -z;
            o[2] = y;
            return o;
        } // x-zy rot x+90
        static xn(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = x;
            o[1] = z;
            o[2] = -y;
            return o;
        } // xz-y rot x-90
        static yp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = -z;
            o[1] = y;
            o[2] = x;
            return o;
        } // -zyx rot y+90
        static yn(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = z;
            o[1] = y;
            o[2] = -x;
            return o;
        } // zy-x rot y-90
        static zp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = y;
            o[1] = -x;
            o[2] = z;
            return o;
        } // y-xz rot z+90
        static zn(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = -y;
            o[1] = x;
            o[2] = z;
            return o;
        } // -yxz rot z-90
        // #endregion
        // #region COMBINATIONS
        static xp_yn(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = -y;
            o[1] = -z;
            o[2] = x;
            return o;
        } // -y-zx rot x+90, y-90
        static xp_yp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = y;
            o[1] = -z;
            o[2] = -x;
            return o;
        } // y-z-x rot x+90, y+90
        static xp_yp_yp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = -x;
            o[1] = -z;
            o[2] = -y;
            return o;
        } // -x-z-y rot x+90, y+90, y+90
        static xp_xp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = x;
            o[1] = -y;
            o[2] = -z;
            return o;
        } // x-y-z rot x+90, x+90
    }
    const createRoundedBox = ({ width = 1, height = 1, depth = 1, radius = 0.5, div = 4, }) => {
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const panel = edge_grid(width, height, depth, radius, div); // Creates the Geo of just the Top Plane of the
        const geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // TODO, Knowing the Plane's Vert Count, It would be better to pre-allocate all the space
        // in TypedArrays then fill in all the data. Using Javascript arrays makes things simple
        // for programming but isn't as efficent.
        // Rotate and Merge the Panel Data into one Geo to form a Rounded Quad
        geo_rot_merge(geo, panel, (v, o) => {
            o[0] = v[0];
            o[1] = v[1];
            o[2] = v[2];
            return o;
        }); // Top - No Rotation, Kind of a Waste
        geo_rot_merge(geo, panel, VRot90.xp); // Front
        geo_rot_merge(geo, panel, VRot90.xp_yp); // Left
        geo_rot_merge(geo, panel, VRot90.xp_yp_yp); // Back
        geo_rot_merge(geo, panel, VRot90.xp_yn); // Right
        geo_rot_merge(geo, panel, VRot90.xp_xp); // Bottom
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        return {
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        };
    };
    // Generate a Plane where all its vertices are focus onto the corners
    // Then those corners are sphere-ified to create rounded corners on the plane
    function edge_grid(width = 2, height = 2, depth = 2, radius = 0.5, div = 4) {
        const mx = width / 2, my = height / 2, mz = depth / 2, len = div * 2;
        const verts = [];
        const uv = [];
        const norm = [];
        const v = create$1();
        let bit, j, i, t, s, x, y, z;
        y = my;
        // Use corners kinda like Marching Squares
        const corners = [
            fromValues(radius - mx, my - radius, radius - mz),
            fromValues(mx - radius, my - radius, radius - mz),
            fromValues(radius - mx, my - radius, mz - radius),
            fromValues(mx - radius, my - radius, mz - radius),
        ];
        const row = (z, zbit) => {
            let t, bit;
            const uv_z = normalizeNumber(-mz, mz, z); // Map Z and Normalize the Value
            for (i = 0; i <= len; i++) {
                bit = i <= div ? 0 : 1;
                t = triangleWave(i / div); // 0 > 1 > 0
                s = i <= div ? -1 : 1; // Sign
                x = mx * s + radius * t * -s; // Flip Signs based if i <= div
                set(v, x, y, z);
                sub(v, v, corners[bit | zbit]);
                normalize(v, v);
                norm.push(v[0], v[1], v[2]); // Save it
                scale$1(v, v, radius);
                add(v, v, corners[bit | zbit]);
                verts.push(v[0], v[1], v[2]); // Save Vert
                uv.push(normalizeNumber(-mx, mx, x), uv_z);
                //App.Debug.pnt( v );
                // Start the mirror side when done with the first side
                if (t == 1) {
                    set(v, mx - radius, y, z);
                    sub(v, v, corners[1 | zbit]);
                    normalize(v, v);
                    norm.push(v[0], v[1], v[2]);
                    scale$1(v, v, radius);
                    add(v, v, corners[1 | zbit]);
                    verts.push(v[0], v[1], v[2]);
                    uv.push(normalizeNumber(-mx, mx, mx - radius), uv_z);
                    // App.Debug.pnt( v );
                }
            }
        };
        for (j = 0; j <= len; j++) {
            // Compute Z Position
            bit = j <= div ? 0 : 2;
            t = triangleWave(j / div); // 0 > 1 > 0
            s = j <= div ? -1 : 1; // Sign
            z = mz * s + radius * t * -s; // Flip Signs based if i <= div
            row(z, bit); // Draw Row
            if (t == 1)
                row(mz - radius, 2); // Start Mirror Side
        }
        return { verts, uv, norm, indices: grid_tri_idx(len + 1, len + 1) };
    }
    // Rotate Vertices/Normals, then Merge All the Vertex Attributes into One Geo
    function geo_rot_merge(geo, obj, fn_rot) {
        const offset = geo.verts.length / 3;
        const len = obj.verts.length;
        const v = create$1(), o = create$1();
        for (let i = 0; i < len; i += 3) {
            // Rotate Vertices
            set(v, obj.verts[i], obj.verts[i + 1], obj.verts[i + 2]);
            fn_rot(v, o);
            geo.verts.push(o[0], o[1], o[2]);
            // Rotate Normal
            set(v, obj.norm[i], obj.norm[i + 1], obj.norm[i + 2]);
            fn_rot(v, o);
            geo.norm.push(o[0], o[1], o[2]);
        }
        for (const v of obj.uv) {
            geo.uv.push(v);
        }
        for (const v of obj.indices) {
            geo.indices.push(offset + v);
        }
    }
    // Generate Indices for a Grid Mesh
    function grid_tri_idx(x_cells, y_cells) {
        let ary = [], col_cnt = x_cells + 1, x, y, a, b, c, d;
        for (y = 0; y < y_cells; y++) {
            for (x = 0; x < x_cells; x++) {
                a = y * col_cnt + x;
                b = a + col_cnt;
                c = b + 1;
                d = a + 1;
                ary.push(a, b, c, c, d, a);
            }
        }
        return ary;
    }

    // @ts-nocheck
    const createRoundedBoxSeparateFace = ({ width = 1, height = 1, depth = 1, radius = 0.5, div = 4, }) => {
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const panel = edge_grid$1(width, height, depth, radius, div); // Create
        const sidesData = [];
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // TODO, Knowing the Plane's Vert Count, It would be better to pre-allocate all the space
        // in TypedArrays then fill in all the data. Using Javascript arrays makes things simple
        // for programming but isn't as efficent.
        // Rotate and Merge the Panel Data into one Geo to form a Rounded Quad
        let geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge$1(geo, panel, (v, o) => {
            o[0] = v[0];
            o[1] = v[1];
            o[2] = v[2];
            return o;
        }); // Top - No Rotation, Kind of a Waste
        sidesData.push({
            orientation: 'top',
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge$1(geo, panel, VRot90.xp); // Front
        sidesData.push({
            orientation: CUBE_SIDE_FRONT,
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge$1(geo, panel, VRot90.xp_yp); // Left
        sidesData.push({
            orientation: CUBE_SIDE_LEFT,
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge$1(geo, panel, VRot90.xp_yp_yp); // Back
        sidesData.push({
            orientation: CUBE_SIDE_BACK,
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge$1(geo, panel, VRot90.xp_yn); // Right
        sidesData.push({
            orientation: CUBE_SIDE_RIGHT,
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge$1(geo, panel, VRot90.xp_xp); // Bottom
        sidesData.push({
            orientation: CUBE_SIDE_BOTTOM,
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        return sidesData;
    };
    // Generate a Plane where all its vertices are focus onto the corners
    // Then those corners are sphere-ified to create rounded corners on the plane
    function edge_grid$1(width = 2, height = 2, depth = 2, radius = 0.5, div = 4) {
        const mx = width / 2, my = height / 2, mz = depth / 2, len = div * 2;
        const verts = [];
        const uv = [];
        const norm = [];
        const v = create$1();
        let bit, j, i, t, s, x, y, z;
        y = my;
        // Use corners kinda like Marching Squares
        const corners = [
            fromValues(radius - mx, my - radius, radius - mz),
            fromValues(mx - radius, my - radius, radius - mz),
            fromValues(radius - mx, my - radius, mz - radius),
            fromValues(mx - radius, my - radius, mz - radius),
        ];
        const row = (z, zbit) => {
            let t, bit;
            const uv_z = normalizeNumber(-mz, mz, z); // Map Z and Normalize the Value
            for (i = 0; i <= len; i++) {
                bit = i <= div ? 0 : 1;
                t = triangleWave(i / div); // 0 > 1 > 0
                s = i <= div ? -1 : 1; // Sign
                x = mx * s + radius * t * -s; // Flip Signs based if i <= div
                set(v, x, y, z);
                sub(v, v, corners[bit | zbit]);
                normalize(v, v);
                norm.push(v[0], v[1], v[2]); // Save it
                scale$1(v, v, radius);
                add(v, v, corners[bit | zbit]);
                verts.push(v[0], v[1], v[2]); // Save Vert
                uv.push(normalizeNumber(-mx, mx, x), uv_z);
                //App.Debug.pnt( v );
                // Start the mirror side when done with the first side
                if (t == 1) {
                    set(v, mx - radius, y, z);
                    sub(v, v, corners[1 | zbit]);
                    normalize(v, v);
                    norm.push(v[0], v[1], v[2]);
                    scale$1(v, v, radius);
                    add(v, v, corners[1 | zbit]);
                    verts.push(v[0], v[1], v[2]);
                    uv.push(normalizeNumber(-mx, mx, mx - radius), uv_z);
                    // App.Debug.pnt( v );
                }
            }
        };
        for (j = 0; j <= len; j++) {
            // Compute Z Position
            bit = j <= div ? 0 : 2;
            t = triangleWave(j / div); // 0 > 1 > 0
            s = j <= div ? -1 : 1; // Sign
            z = mz * s + radius * t * -s; // Flip Signs based if i <= div
            row(z, bit); // Draw Row
            if (t == 1)
                row(mz - radius, 2); // Start Mirror Side
        }
        return { verts, uv, norm, indices: grid_tri_idx$1(len + 1, len + 1) };
    }
    // Rotate Vertices/Normals, then Merge All the Vertex Attributes into One Geo
    function geo_rot_merge$1(geo, obj, fn_rot) {
        const offset = geo.verts.length / 3;
        const len = obj.verts.length;
        const v = create$1(), o = create$1();
        for (let i = 0; i < len; i += 3) {
            // Rotate Vertices
            set(v, obj.verts[i], obj.verts[i + 1], obj.verts[i + 2]);
            fn_rot(v, o);
            geo.verts.push(o[0], o[1], o[2]);
            // Rotate Normal
            set(v, obj.norm[i], obj.norm[i + 1], obj.norm[i + 2]);
            fn_rot(v, o);
            geo.norm.push(o[0], o[1], o[2]);
        }
        for (const v of obj.uv) {
            geo.uv.push(v);
        }
        for (const v of obj.indices) {
            geo.indices.push(offset + v);
        }
    }
    // Generate Indices for a Grid Mesh
    function grid_tri_idx$1(x_cells, y_cells) {
        let ary = [], col_cnt = x_cells + 1, x, y, a, b, c, d;
        for (y = 0; y < y_cells; y++) {
            for (x = 0; x < x_cells; x++) {
                a = y * col_cnt + x;
                b = a + col_cnt;
                c = b + 1;
                d = a + 1;
                ary.push(a, b, c, c, d, a);
            }
        }
        return ary;
    }

    /**
     * @description Generate circle geometry
     * @param {Circle} params
     * @returns {{ vertices, normal, uv, indices }}
     */
    function createCircle(params = {}) {
        const { radius = 1, segments = 8, thetaStart = 0, thetaLength = Math.PI * 2, } = params;
        const indices = [];
        const vertices = [];
        const normals = [];
        const uvs = [];
        // helper variables
        const vertex = create$1();
        const uv = create$2();
        // center point
        vertices.push(0, 0, 0);
        normals.push(0, 0, 1);
        uvs.push(0.5, 0.5);
        for (let s = 0, i = 3; s <= segments; s++, i += 3) {
            const segment = thetaStart + s / segments * thetaLength;
            // vertex
            vertex[0] = radius * Math.cos(segment);
            vertex[1] = radius * Math.sin(segment);
            vertices.push(...vertex);
            // normal
            normals.push(0, 0, 1);
            // uvs
            uv[0] = (vertices[i] / radius + 1) / 2;
            uv[1] = (vertices[i + 1] / radius + 1) / 2;
            uvs.push(uv[0], uv[1]);
        }
        // indices
        for (let i = 1; i <= segments; i++) {
            indices.push(i, i + 1, 0);
        }
        return {
            indices: segments > 65536 ? new Uint32Array(indices) : new Uint16Array(indices),
            vertices: new Float32Array(vertices),
            normal: new Float32Array(normals),
            uv: new Float32Array(uvs),
        };
    }

    /**
     * Generates geometry data for a quad
     * @param {PlaneInterface} params
     * @returns {{ vertices, normal, uv, indices }}
     */
    function createPlane(params = {}) {
        const { width = 1, height = 1, widthSegments = 1, heightSegments = 1, } = params;
        const wSegs = widthSegments;
        const hSegs = heightSegments;
        // Determine length of arrays
        const num = (wSegs + 1) * (hSegs + 1);
        const numIndices = wSegs * hSegs * 6;
        // Generate empty arrays once
        const position = new Float32Array(num * 3);
        const normal = new Float32Array(num * 3);
        const uv = new Float32Array(num * 2);
        const index = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
        buildPlane(position, normal, uv, index, width, height, 0, wSegs, hSegs);
        return {
            vertices: position,
            normal,
            uv,
            indices: index,
        };
    }

    /**
     * Generates geometry data for a sphere
     * @param {Sphere} params
     * @returns {{ vertices, normal, uv, indices }}
     */
    function createSphere(params = {}) {
        const { radius = 0.5, widthSegments = 16, heightSegments = Math.ceil(widthSegments * 0.5), phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI, } = params;
        const wSegs = widthSegments;
        const hSegs = heightSegments;
        const pStart = phiStart;
        const pLength = phiLength;
        const tStart = thetaStart;
        const tLength = thetaLength;
        const num = (wSegs + 1) * (hSegs + 1);
        const numIndices = wSegs * hSegs * 6;
        const position = new Float32Array(num * 3);
        const normal = new Float32Array(num * 3);
        const uv = new Float32Array(num * 2);
        const index = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
        let i = 0;
        let iv = 0;
        let ii = 0;
        const te = tStart + tLength;
        const grid = [];
        const n = create$1();
        for (let iy = 0; iy <= hSegs; iy++) {
            const vRow = [];
            const v = iy / hSegs;
            for (let ix = 0; ix <= wSegs; ix++, i++) {
                const u = ix / wSegs;
                const x = -radius *
                    Math.cos(pStart + u * pLength) *
                    Math.sin(tStart + v * tLength);
                const y = radius * Math.cos(tStart + v * tLength);
                const z = radius * Math.sin(pStart + u * pLength) * Math.sin(tStart + v * tLength);
                position[i * 3] = x;
                position[i * 3 + 1] = y;
                position[i * 3 + 2] = z;
                set(n, x, y, z);
                normalize(n, n);
                normal[i * 3] = n[0];
                normal[i * 3 + 1] = n[1];
                normal[i * 3 + 2] = n[2];
                uv[i * 2] = u;
                uv[i * 2 + 1] = 1 - v;
                vRow.push(iv++);
            }
            grid.push(vRow);
        }
        for (let iy = 0; iy < hSegs; iy++) {
            for (let ix = 0; ix < wSegs; ix++) {
                const a = grid[iy][ix + 1];
                const b = grid[iy][ix];
                const c = grid[iy + 1][ix];
                const d = grid[iy + 1][ix + 1];
                if (iy !== 0 || tStart > 0) {
                    index[ii * 3] = a;
                    index[ii * 3 + 1] = b;
                    index[ii * 3 + 2] = d;
                    ii++;
                }
                if (iy !== hSegs - 1 || te < Math.PI) {
                    index[ii * 3] = b;
                    index[ii * 3 + 1] = c;
                    index[ii * 3 + 2] = d;
                    ii++;
                }
            }
        }
        return {
            vertices: position,
            normal,
            uv,
            indices: index,
        };
    }

    /**
     * @description Generate torus geometry
     * @param {Torus} params
     * @returns {{ vertices, normal, uv, indices }}
     */
    function createTorus(params = {}) {
        const { radius = 0.5, tube = 0.35, arc = Math.PI * 2, radialSegments: inputRadialSegments = 8, tubularSegments: inputTubularSegments = 6, } = params;
        const radialSegments = Math.floor(inputRadialSegments);
        const tubularSegments = Math.floor(inputTubularSegments);
        const indices = [];
        const vertices = [];
        const normals = [];
        const uvs = [];
        const center = create$1();
        const vertex = create$1();
        const normal = create$1();
        for (let j = 0; j <= radialSegments; j++) {
            for (let i = 0; i <= tubularSegments; i++) {
                const u = i / tubularSegments * arc;
                const v = j / radialSegments * Math.PI * 2;
                // vertex
                vertex[0] = (radius + tube * Math.cos(v)) * Math.cos(u);
                vertex[1] = (radius + tube * Math.cos(v)) * Math.sin(u);
                vertex[2] = tube * Math.sin(v);
                vertices.push(vertex[0], vertex[1], vertex[2]);
                // normal
                center[0] = radius * Math.cos(u);
                center[1] = radius * Math.sin(u);
                sub(normal, vertex, center);
                normalize(normal, normal);
                normals.push(normal[0], normal[1], normal[0]);
                // uv
                uvs.push(i / tubularSegments, j / radialSegments);
            }
        }
        // generate indices
        for (let j = 1; j <= radialSegments; j++) {
            for (let i = 1; i <= tubularSegments; i++) {
                // indices
                const a = (tubularSegments + 1) * j + i - 1;
                const b = (tubularSegments + 1) * (j - 1) + i - 1;
                const c = (tubularSegments + 1) * (j - 1) + i;
                const d = (tubularSegments + 1) * j + i;
                // faces
                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }
        const num = (radialSegments + 1) * (tubularSegments + 1);
        return {
            indices: num > 65536 ? new Uint32Array(indices) : new Uint16Array(indices),
            vertices: new Float32Array(vertices),
            normal: new Float32Array(normals),
            uv: new Float32Array(uvs),
        };
    }

    /**
     * @namespace GeometryUtils
     */
    const GeometryUtils = {
        createBox,
        createBoxSeparateFace,
        createRoundedBoxSeparateFace,
        createRoundedBox,
        createCircle,
        createPlane,
        createSphere,
        createTorus,
    };

    var index = /*#__PURE__*/Object.freeze({
        __proto__: null,
        createBox: createBox,
        createBoxSeparateFace: createBoxSeparateFace,
        createRoundedBoxSeparateFace: createRoundedBoxSeparateFace,
        createRoundedBox: createRoundedBox,
        createCircle: createCircle,
        createPlane: createPlane,
        createSphere: createSphere,
        createTorus: createTorus,
        GeometryUtils: GeometryUtils
    });

    var _gl$5, _framebuffers, _programs, _textures, _camera, _activeProgram, _textureType;
    class SwapRenderer {
        constructor(gl) {
            _gl$5.set(this, void 0);
            _framebuffers.set(this, new Map());
            _programs.set(this, new Map());
            _textures.set(this, new Map());
            _camera.set(this, void 0);
            _activeProgram.set(this, void 0);
            _textureType.set(this, void 0);
            __classPrivateFieldSet(this, _gl$5, gl);
            __classPrivateFieldSet(this, _camera, new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 2));
            __classPrivateFieldGet(this, _camera).position = [0, 0, 1];
            __classPrivateFieldGet(this, _camera).lookAt([0, 0, 0]);
            const ext = getExtension(gl, 'WEBGL_color_buffer_float');
            getExtension(gl, 'OES_texture_float');
            if (ext) {
                __classPrivateFieldSet(this, _textureType, gl.FLOAT);
            }
            else {
                const ext = getExtension(gl, 'EXT_color_buffer_half_float');
                const ext2 = getExtension(gl, 'OES_texture_half_float');
                if (ext) {
                    __classPrivateFieldSet(this, _textureType, ext2.HALF_FLOAT_OES);
                }
                else {
                    __classPrivateFieldSet(this, _textureType, gl.UNSIGNED_BYTE);
                }
            }
        }
        /**
         * @returns {Texture}
         */
        getTexture(name) {
            const texture = __classPrivateFieldGet(this, _textures).get(name);
            return texture;
        }
        /**
         * Add external texture
         * @param {string} name Name for referencing later
         * @param {Texture} texture
         * @returns {this}
         */
        addTexture(name, texture) {
            __classPrivateFieldGet(this, _textures).set(name, texture);
            return this;
        }
        /**
         * Add external framebuffer
         * @param {string} name Name for referencing later
         * @param {Framebuffer} framebuffer
         * @returns
         */
        addFramebuffer(name, framebuffer) {
            __classPrivateFieldGet(this, _framebuffers).set(name, framebuffer);
            return this;
        }
        /**
         * @param {string} name Name for referencing later
         * @param {number} width
         * @param {number} height
         * @param {Float32Array} data
         * @param {GLenum} filtering
         * @param {GLenum} inputType
         * @returns {this}
         */
        createTexture(name, width, height, data, filtering = __classPrivateFieldGet(this, _gl$5).NEAREST, inputType) {
            const texture = new Texture(__classPrivateFieldGet(this, _gl$5), {
                type: inputType || __classPrivateFieldGet(this, _textureType),
                format: __classPrivateFieldGet(this, _gl$5).RGBA,
                minFilter: filtering,
                magFilter: filtering,
            });
            texture.bind();
            if (data) {
                texture.fromData(data, width, height);
            }
            else {
                texture.fromSize(width, height);
            }
            texture.unbind();
            this.addTexture(name, texture);
            return this;
        }
        /**
         * @param {string} name Name for referencing later
         * @param {number} width
         * @param {number} height
         * @returns {this}
         */
        createFramebuffer(name, width, height) {
            const inputTexture = __classPrivateFieldGet(this, _textures).get(name);
            const framebuffer = new Framebuffer(__classPrivateFieldGet(this, _gl$5), {
                width,
                height,
                depth: false,
                inputTexture,
            });
            this.addFramebuffer(name, framebuffer);
            return this;
        }
        /**
         * @param {string} programName
         * @param {string} vertexShaderSource
         * @param {string} fragmentShaderSource
         * @returns {this}
         */
        createProgram(programName, vertexShaderSource, fragmentShaderSource) {
            const { indices, vertices, uv } = createPlane();
            const geometry = new Geometry(__classPrivateFieldGet(this, _gl$5));
            geometry
                .addIndex({ typedArray: indices })
                .addAttribute('position', { typedArray: vertices, size: 3 })
                .addAttribute('uv', { typedArray: uv, size: 2 });
            const mesh = new Mesh(__classPrivateFieldGet(this, _gl$5), {
                geometry,
                vertexShaderSource,
                fragmentShaderSource,
            });
            __classPrivateFieldGet(this, _programs).set(programName, mesh);
            return this;
        }
        /**
         * Binds a program for use
         * @param {string} programName
         * @returns {this}
         */
        useProgram(programName) {
            __classPrivateFieldSet(this, _activeProgram, __classPrivateFieldGet(this, _programs).get(programName));
            __classPrivateFieldGet(this, _activeProgram).use();
            return this;
        }
        /**
         * Sets a uniform to the active program
         * @param {string} uniformName
         * @param {string} uniformType
         * @param {string} uniformValue
         * @returns {this}
         */
        setUniform(uniformName, uniformType, uniformValue) {
            __classPrivateFieldGet(this, _activeProgram).setUniform(uniformName, uniformType, uniformValue);
            return this;
        }
        /**
         * Set gl viewport size
         * @param {number} width
         * @param {number} height
         * @returns {this}
         */
        setSize(width, height) {
            __classPrivateFieldGet(this, _gl$5).viewport(0, 0, width, height);
            return this;
        }
        /**
         * Renders a program with specific inputs to output framebuffer
         * @param {String[]} inputNameArr - Name of input framebuffers
         * @param outputName - Name of output framebuffer. "null" to render to device screen
         * @returns
         */
        run(inputNameArr, outputName) {
            let framebuffer;
            if (outputName) {
                framebuffer = __classPrivateFieldGet(this, _framebuffers).get(outputName);
                framebuffer.bind();
            }
            else {
                __classPrivateFieldGet(this, _gl$5).bindFramebuffer(__classPrivateFieldGet(this, _gl$5).FRAMEBUFFER, null);
            }
            for (let i = 0; i < inputNameArr.length; i++) {
                const inputName = inputNameArr[i];
                const inputTexture = __classPrivateFieldGet(this, _textures).get(inputName);
                __classPrivateFieldGet(this, _gl$5).activeTexture(__classPrivateFieldGet(this, _gl$5).TEXTURE0 + i);
                inputTexture.bind();
            }
            __classPrivateFieldGet(this, _activeProgram).setCamera(__classPrivateFieldGet(this, _camera)).draw();
            if (framebuffer) {
                framebuffer.unbind();
            }
            return this;
        }
        /**
         * Swap programs
         * @param {string} name1
         * @param {string} name2
         * @returns {this}
         */
        swap(name1, name2) {
            const tex1 = __classPrivateFieldGet(this, _textures).get(name1);
            const tex2 = __classPrivateFieldGet(this, _textures).get(name2);
            __classPrivateFieldGet(this, _textures).set(name1, tex2);
            __classPrivateFieldGet(this, _textures).set(name2, tex1);
            const fbo1 = __classPrivateFieldGet(this, _framebuffers).get(name1);
            const fbo2 = __classPrivateFieldGet(this, _framebuffers).get(name2);
            __classPrivateFieldGet(this, _framebuffers).set(name1, fbo2);
            __classPrivateFieldGet(this, _framebuffers).set(name2, fbo1);
            return this;
        }
        /**
         * @returns {this}
         */
        reset() {
            __classPrivateFieldGet(this, _framebuffers).clear();
            __classPrivateFieldGet(this, _programs).clear();
            return this;
        }
        /**
         * @returns {this}
         */
        delete() {
            for (const framebuffer of Object.values(__classPrivateFieldGet(this, _framebuffers))) {
                framebuffer.delete();
            }
            for (const program of Object.values(__classPrivateFieldGet(this, _programs))) {
                program.delete();
            }
            return this;
        }
    }
    _gl$5 = new WeakMap(), _framebuffers = new WeakMap(), _programs = new WeakMap(), _textures = new WeakMap(), _camera = new WeakMap(), _activeProgram = new WeakMap(), _textureType = new WeakMap();

    exports.CUBE_SIDE_BACK = CUBE_SIDE_BACK;
    exports.CUBE_SIDE_BOTTOM = CUBE_SIDE_BOTTOM;
    exports.CUBE_SIDE_FRONT = CUBE_SIDE_FRONT;
    exports.CUBE_SIDE_LEFT = CUBE_SIDE_LEFT;
    exports.CUBE_SIDE_RIGHT = CUBE_SIDE_RIGHT;
    exports.CUBE_SIDE_TOP = CUBE_SIDE_TOP;
    exports.CameraController = CameraController;
    exports.CubeTexture = CubeTexture;
    exports.Framebuffer = Framebuffer;
    exports.Geometry = Geometry;
    exports.GeometryUtils = index;
    exports.INDEX_ATTRIB_NAME = INDEX_ATTRIB_NAME;
    exports.INSTANCED_OFFSET_MODEL_MATRIX = INSTANCED_OFFSET_MODEL_MATRIX;
    exports.InstancedMesh = InstancedMesh;
    exports.LINES = LINES;
    exports.MODEL_MATRIX_UNIFORM_NAME = MODEL_MATRIX_UNIFORM_NAME;
    exports.Mesh = Mesh;
    exports.OrthographicCamera = OrthographicCamera;
    exports.POINTS = POINTS;
    exports.POSITION_ATTRIB_NAME = POSITION_ATTRIB_NAME;
    exports.PROJECTION_MATRIX_UNIFORM_NAME = PROJECTION_MATRIX_UNIFORM_NAME;
    exports.PerspectiveCamera = PerspectiveCamera;
    exports.Program = Program;
    exports.STATIC_DRAW = STATIC_DRAW;
    exports.SwapRenderer = SwapRenderer;
    exports.TRIANGLES = TRIANGLES;
    exports.Texture = Texture;
    exports.Transform = Transform;
    exports.UNIFORM_TYPE_FLOAT = UNIFORM_TYPE_FLOAT;
    exports.UNIFORM_TYPE_INT = UNIFORM_TYPE_INT;
    exports.UNIFORM_TYPE_MATRIX4X4 = UNIFORM_TYPE_MATRIX4X4;
    exports.UNIFORM_TYPE_VEC2 = UNIFORM_TYPE_VEC2;
    exports.UNIFORM_TYPE_VEC3 = UNIFORM_TYPE_VEC3;
    exports.UNIFORM_TYPE_VEC4 = UNIFORM_TYPE_VEC4;
    exports.VIEW_MATRIX_UNIFORM_NAME = VIEW_MATRIX_UNIFORM_NAME;
    exports.clamp = clamp;
    exports.compileShader = compileShader;
    exports.createBuffer = createBuffer;
    exports.createIndexBuffer = createIndexBuffer;
    exports.createProgram = createProgram;
    exports.getExtension = getExtension;
    exports.isPowerOf2 = isPowerOf2;
    exports.mapNumberRange = mapNumberRange;
    exports.normalizeNumber = normalizeNumber;
    exports.triangleWave = triangleWave;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
