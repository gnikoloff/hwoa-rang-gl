(function (Stats, dat) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var Stats__default = /*#__PURE__*/_interopDefaultLegacy(Stats);

  /**
   * Common utilities
   * @module glMatrix
   */
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
   * 4 Dimensional Vector
   * @module vec4
   */

  /**
   * Creates a new, empty vec4
   *
   * @returns {vec4} a new 4D vector
   */

  function create$2() {
    var out = new ARRAY_TYPE(4);

    if (ARRAY_TYPE != Float32Array) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
    }

    return out;
  }
  /**
   * Perform some operation over an array of vec4s.
   *
   * @param {Array} a the array of vectors to iterate over
   * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
   * @param {Number} offset Number of elements to skip at the beginning of the array
   * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
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
        stride = 4;
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
        vec[3] = a[i + 3];
        fn(vec, vec, arg);
        a[i] = vec[0];
        a[i + 1] = vec[1];
        a[i + 2] = vec[2];
        a[i + 3] = vec[3];
      }

      return a;
    };
  }());

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
  const TRIANGLES = 0x0004;

  const STATIC_DRAW = 0x88e4;

  /**
   * Create and compile WebGLShader
   * @param {(WebGL1RenderingContext|WebGL2RenderingContext)} gl
   * @param {GLenum} shaderType
   * @param {string} shaderSource
   * @returns {WebGLShader}
   */
  function compileShader(gl, shaderType, shaderSource) {
      const shader = gl.createShader(shaderType);
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
      return;
  }
  /**
   * Create and link WebGLProgram with provided shader strings
   * @param {(WebGL1RenderingContext|WebGL2RenderingContext)} gl
   * @param {string} vertexShaderSource
   * @param {string} fragmentShaderSource
   * @returns {WebGLProgram}
   */
  function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
      const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
      const program = gl.createProgram();
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
      console.error(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
  }
  /**
   * Create a ARRAY_BUFFER buffer
   * @param {(WebGL1RenderingContext|WebGL2RenderingContext)} gl
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
   * @param {(WebGL1RenderingContext|WebGL2RenderingContext)} gl
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
   * @param {(WebGL1RenderingContext|WebGL2RenderingContext)} gl
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
      setUniform(uniformName, uniformType, uniformValue) {
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
                  return;
          }
          return this;
      }
      /**
       * Get the location for an attribute
       * @param {string} attribName
       * @returns {number} attribLocation
       */
      getAttribLocation(attribName) {
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
       * @description Delete all buffers associated with this geometry
       */
      delete() {
          this.attributes.forEach(({ buffer }) => {
              __classPrivateFieldGet(this, _gl$1).deleteBuffer(buffer);
          });
      }
  }
  _gl$1 = new WeakMap();

  /**
   * Common utilities
   * @module glMatrix
   */
  // Configuration Constants
  var EPSILON = 0.000001;
  var ARRAY_TYPE$1 = typeof Float32Array !== 'undefined' ? Float32Array : Array;
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

  function create$3() {
    var out = new ARRAY_TYPE$1(16);

    if (ARRAY_TYPE$1 != Float32Array) {
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

  function identity$1(out) {
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

  function translate$1(out, a, v) {
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

  function scale$1(out, a, v) {
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
   * Rotates a mat4 by the given angle around the given axis
   *
   * @param {mat4} out the receiving matrix
   * @param {ReadonlyMat4} a the matrix to rotate
   * @param {Number} rad the angle to rotate the matrix by
   * @param {ReadonlyVec3} axis the axis to rotate around
   * @returns {mat4} out
   */

  function rotate(out, a, rad, axis) {
    var x = axis[0],
        y = axis[1],
        z = axis[2];
    var len = Math.hypot(x, y, z);
    var s, c, t;
    var a00, a01, a02, a03;
    var a10, a11, a12, a13;
    var a20, a21, a22, a23;
    var b00, b01, b02;
    var b10, b11, b12;
    var b20, b21, b22;

    if (len < EPSILON) {
      return null;
    }

    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;
    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;
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
    a23 = a[11]; // Construct the elements of the rotation matrix

    b00 = x * x * t + c;
    b01 = y * x * t + z * s;
    b02 = z * x * t - y * s;
    b10 = x * y * t - z * s;
    b11 = y * y * t + c;
    b12 = z * y * t + x * s;
    b20 = x * z * t + y * s;
    b21 = y * z * t - x * s;
    b22 = z * z * t + c; // Perform rotation-specific matrix multiplication

    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) {
      // If the source and destination differ, copy the unchanged last row
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }

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
      return identity$1(out);
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

  function create$1$1() {
    var out = new ARRAY_TYPE$1(3);

    if (ARRAY_TYPE$1 != Float32Array) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
    }

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

  function set$1(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
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
    var vec = create$1$1();
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

  var _position, _positionVec3, _scale, _scaleVec3, _rotationAxis, _rotationAxisVec3, _rotationAngle, _gl$2, _geometry;
  /**
   * Mesh class for holding the geometry, program and shaders for an object.
   *
   * @public
   */
  class Mesh {
      constructor(gl, params) {
          _position.set(this, [0, 0, 0]);
          _positionVec3.set(this, create$1$1());
          _scale.set(this, [1, 1, 1]);
          _scaleVec3.set(this, create$1$1());
          _rotationAxis.set(this, [0, 0, 0]);
          _rotationAxisVec3.set(this, create$1$1());
          _rotationAngle.set(this, 0);
          _gl$2.set(this, void 0);
          _geometry.set(this, void 0);
          this.modelMatrixNeedsUpdate = false;
          this.modelMatrix = create$3();
          /**
           * DrawMode
           * @default gl.TRIANGLES
           */
          this.drawMode = TRIANGLES;
          const { geometry, uniforms = {}, vertexShaderSource, fragmentShaderSource, } = params;
          __classPrivateFieldSet(this, _gl$2, gl);
          __classPrivateFieldSet(this, _geometry, geometry);
          this.program = new Program(gl, { vertexShaderSource, fragmentShaderSource });
          this.vaoExtension = getExtension(gl, 'OES_vertex_array_object');
          this.vao = this.vaoExtension.createVertexArrayOES();
          this.hasIndices = geometry.attributes.has(INDEX_ATTRIB_NAME);
          set$1(__classPrivateFieldGet(this, _scaleVec3), __classPrivateFieldGet(this, _scale)[0], __classPrivateFieldGet(this, _scale)[1], __classPrivateFieldGet(this, _scale)[2]);
          this.vaoExtension.bindVertexArrayOES(this.vao);
          geometry.attributes.forEach(({ size, type, normalized, stride, offset, buffer }, key) => {
              if (key === INDEX_ATTRIB_NAME) {
                  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
                  return;
              }
              const location = this.program.getAttribLocation(key);
              if (location === -1) {
                  return;
              }
              __classPrivateFieldGet(this, _gl$2).bindBuffer(__classPrivateFieldGet(this, _gl$2).ARRAY_BUFFER, buffer);
              __classPrivateFieldGet(this, _gl$2).vertexAttribPointer(location, size, type, normalized, stride, offset);
              __classPrivateFieldGet(this, _gl$2).enableVertexAttribArray(location);
          });
          this.vaoExtension.bindVertexArrayOES(null);
          this.program.bind();
          for (const [key, uniform] of Object.entries(uniforms)) {
              this.program.setUniform(key, uniform['type'], uniform['value']);
          }
          this.program.setUniform(MODEL_MATRIX_UNIFORM_NAME, UNIFORM_TYPE_MATRIX4X4, this.modelMatrix);
          this.program.unbind();
          return this;
      }
      get position() {
          return __classPrivateFieldGet(this, _position);
      }
      get scale() {
          return __classPrivateFieldGet(this, _scale);
      }
      /**
       * Set uniform value. Query the uniform location if necessary and cache it in-memory for future use
       * @param {string} uniformName
       * @param {UniformType} uniformType
       * @param uniformValue
       * @returns {this}
       */
      setUniform(uniformName, uniformType, uniformValue) {
          this.program.bind();
          this.program.setUniform(uniformName, uniformType, uniformValue);
          this.program.unbind();
          return this;
      }
      /**
       * Sets position
       * @returns {this}
       */
      setPosition(position) {
          const { x = __classPrivateFieldGet(this, _position)[0], y = __classPrivateFieldGet(this, _position)[1], z = __classPrivateFieldGet(this, _position)[2], } = position;
          __classPrivateFieldSet(this, _position, [x, y, z]);
          set$1(__classPrivateFieldGet(this, _positionVec3), x, y, z);
          this.modelMatrixNeedsUpdate = true;
          return this;
      }
      /**
       * Sets scale
       * @returns {this}
       */
      setScale(scale) {
          const { x = __classPrivateFieldGet(this, _scale)[0], y = __classPrivateFieldGet(this, _scale)[1], z = __classPrivateFieldGet(this, _scale)[2] } = scale;
          __classPrivateFieldSet(this, _scale, [x, y, z]);
          set$1(__classPrivateFieldGet(this, _scaleVec3), x, y, z);
          this.modelMatrixNeedsUpdate = true;
          return this;
      }
      /**
       * Sets rotation
       * @returns {this}
       */
      setRotation(rotation, rotationAngle) {
          const { x = __classPrivateFieldGet(this, _rotationAxis)[0], y = __classPrivateFieldGet(this, _rotationAxis)[1], z = __classPrivateFieldGet(this, _rotationAxis)[2], } = rotation;
          __classPrivateFieldSet(this, _rotationAxis, [x, y, z]);
          set$1(__classPrivateFieldGet(this, _rotationAxisVec3), x, y, z);
          __classPrivateFieldSet(this, _rotationAngle, rotationAngle);
          this.modelMatrixNeedsUpdate = true;
          return this;
      }
      /**
       * Update model matrix with scale, rotation and translation
       * @returns {this}
       */
      updateModelMatrix() {
          identity$1(this.modelMatrix);
          translate$1(this.modelMatrix, this.modelMatrix, __classPrivateFieldGet(this, _positionVec3));
          rotate(this.modelMatrix, this.modelMatrix, __classPrivateFieldGet(this, _rotationAngle), __classPrivateFieldGet(this, _rotationAxisVec3));
          scale$1(this.modelMatrix, this.modelMatrix, __classPrivateFieldGet(this, _scaleVec3));
          this.program.bind();
          this.program.setUniform(MODEL_MATRIX_UNIFORM_NAME, UNIFORM_TYPE_MATRIX4X4, this.modelMatrix);
          this.program.unbind();
          return this;
      }
      /**
       * Assign camera projection matrix and view matrix to model uniforms
       * @param {PerspectiveCamera} camera
       * @returns {this}
       */
      setCamera(camera) {
          this.program.bind();
          this.program.setUniform(PROJECTION_MATRIX_UNIFORM_NAME, UNIFORM_TYPE_MATRIX4X4, camera.projectionMatrix);
          this.program.setUniform(VIEW_MATRIX_UNIFORM_NAME, UNIFORM_TYPE_MATRIX4X4, camera.viewMatrix);
          this.program.unbind();
          return this;
      }
      /**
       * Renders the mesh
       * @returns {this}
       */
      draw() {
          if (this.modelMatrixNeedsUpdate) {
              this.updateModelMatrix();
              this.modelMatrixNeedsUpdate = false;
          }
          this.program.bind();
          this.vaoExtension.bindVertexArrayOES(this.vao);
          if (this.hasIndices) {
              __classPrivateFieldGet(this, _gl$2).drawElements(this.drawMode, __classPrivateFieldGet(this, _geometry).vertexCount, __classPrivateFieldGet(this, _gl$2).UNSIGNED_SHORT, 0);
          }
          else {
              __classPrivateFieldGet(this, _gl$2).drawArrays(this.drawMode, 0, __classPrivateFieldGet(this, _geometry).vertexCount);
          }
          this.vaoExtension.bindVertexArrayOES(null);
          this.program.unbind();
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
  _position = new WeakMap(), _positionVec3 = new WeakMap(), _scale = new WeakMap(), _scaleVec3 = new WeakMap(), _rotationAxis = new WeakMap(), _rotationAxisVec3 = new WeakMap(), _rotationAngle = new WeakMap(), _gl$2 = new WeakMap(), _geometry = new WeakMap();

  var _geometry$1, _gl$3, _instanceAttributes, _instanceExtension;
  class InstancedMesh extends Mesh {
      constructor(gl, { geometry, uniforms, instanceCount = 1, vertexShaderSource, fragmentShaderSource, }) {
          super(gl, { geometry, uniforms, vertexShaderSource, fragmentShaderSource });
          _geometry$1.set(this, void 0);
          _gl$3.set(this, void 0);
          _instanceAttributes.set(this, new Map());
          _instanceExtension.set(this, void 0);
          __classPrivateFieldSet(this, _gl$3, gl);
          __classPrivateFieldSet(this, _geometry$1, geometry);
          __classPrivateFieldSet(this, _instanceExtension, getExtension(gl, 'ANGLE_instanced_arrays'));
          this.instanceCount = instanceCount;
          const instanceMatrixLocation = this.program.getAttribLocation(INSTANCED_OFFSET_MODEL_MATRIX);
          const identityMat = create$3();
          const itemsPerInstance = 16;
          const bytesPerMatrix = itemsPerInstance * Float32Array.BYTES_PER_ELEMENT;
          const matrixData = new Float32Array(itemsPerInstance * instanceCount);
          for (let i = 0; i < instanceCount; i++) {
              for (let n = i * itemsPerInstance, j = 0; n < i * itemsPerInstance + itemsPerInstance; n++) {
                  matrixData[n] = identityMat[j];
                  j++;
              }
          }
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
          __classPrivateFieldGet(this, _instanceAttributes).set(INSTANCED_OFFSET_MODEL_MATRIX, {
              location: instanceMatrixLocation,
              typedArray: matrixData,
              buffer: matrixBuffer,
              size: 4,
              stride: 4 * itemsPerInstance,
              instancedDivisor: 1,
          });
          __classPrivateFieldSet(this, _instanceExtension, getExtension(gl, 'ANGLE_instanced_arrays'));
      }
      /**
       * @param {number} index - Instance index on which to apply the matrix
       * @param {Float32Array|Float64Array} matrix - Matrix to control the instance scale, rotation and translation
       */
      setMatrixAt(index, matrix) {
          const itemsPerInstance = 16;
          const { buffer } = __classPrivateFieldGet(this, _instanceAttributes).get(INSTANCED_OFFSET_MODEL_MATRIX);
          this.vaoExtension.bindVertexArrayOES(this.vao);
          __classPrivateFieldGet(this, _gl$3).bindBuffer(__classPrivateFieldGet(this, _gl$3).ARRAY_BUFFER, buffer);
          __classPrivateFieldGet(this, _gl$3).bufferSubData(__classPrivateFieldGet(this, _gl$3).ARRAY_BUFFER, index * itemsPerInstance * Float32Array.BYTES_PER_ELEMENT, matrix);
          this.vaoExtension.bindVertexArrayOES(null);
          return this;
      }
      /**
       * Draws the instanced mesh
       */
      draw() {
          if (this.modelMatrixNeedsUpdate) {
              this.updateModelMatrix();
              this.modelMatrixNeedsUpdate = false;
          }
          this.program.bind();
          this.vaoExtension.bindVertexArrayOES(this.vao);
          if (this.hasIndices) {
              __classPrivateFieldGet(this, _instanceExtension).drawElementsInstancedANGLE(this.drawMode, __classPrivateFieldGet(this, _geometry$1).vertexCount, __classPrivateFieldGet(this, _gl$3).UNSIGNED_SHORT, 0, this.instanceCount);
          }
          else {
              __classPrivateFieldGet(this, _instanceExtension).drawArraysInstancedANGLE(this.drawMode, 0, __classPrivateFieldGet(this, _geometry$1).vertexCount, this.instanceCount);
          }
          this.program.unbind();
          this.vaoExtension.bindVertexArrayOES(null);
          return this;
      }
  }
  _geometry$1 = new WeakMap(), _gl$3 = new WeakMap(), _instanceAttributes = new WeakMap(), _instanceExtension = new WeakMap();
  /**
   * Check if number is power of 2
   * @param {number} value
   * @returns {number}
   */
  const isPowerOf2 = (value) => (value & (value - 1)) === 0;

  var _gl$4, _texture, _width, _height, _format, _internalFormat, _type, _anisotropyExtension;
  /**
   * Texture class used to store image, video, canvas and data as typed arrays
   * @public
   */
  class Texture {
      constructor(gl, { format = gl.RGB, internalFormat = format, type = gl.UNSIGNED_BYTE, unpackAlignment = 1, wrapS = gl.CLAMP_TO_EDGE, wrapT = gl.CLAMP_TO_EDGE, minFilter = gl.NEAREST, magFilter = gl.NEAREST, } = {}) {
          _gl$4.set(this, void 0);
          _texture.set(this, void 0);
          _width.set(this, void 0);
          _height.set(this, void 0);
          _format.set(this, void 0);
          _internalFormat.set(this, void 0);
          _type.set(this, void 0);
          _anisotropyExtension.set(this, void 0);
          __classPrivateFieldSet(this, _gl$4, gl);
          __classPrivateFieldSet(this, _format, format);
          __classPrivateFieldSet(this, _internalFormat, internalFormat);
          __classPrivateFieldSet(this, _type, type);
          __classPrivateFieldSet(this, _texture, gl.createTexture());
          this.bind()
              .setPixelStore(gl.UNPACK_ALIGNMENT, unpackAlignment)
              .setMinFilter(minFilter)
              .setMagFilter(magFilter)
              .setWrap(wrapS, wrapT)
              .unbind();
          __classPrivateFieldSet(this, _anisotropyExtension, getExtension(gl, 'EXT_texture_filter_anisotropic') ||
              getExtension(gl, 'MOZ_EXT_texture_filter_anisotropic') ||
              getExtension(gl, 'WEBKIT_EXT_texture_filter_anisotropic'));
      }
      /**
       * @returns {WebGLTexture}
       */
      getTexture() {
          return __classPrivateFieldGet(this, _texture);
      }
      /**
       * Binds the texture to gl.TEXTURE_2D
       * @returns {this}
       */
      bind() {
          __classPrivateFieldGet(this, _gl$4).bindTexture(__classPrivateFieldGet(this, _gl$4).TEXTURE_2D, __classPrivateFieldGet(this, _texture));
          return this;
      }
      /**
       * Unbinds the texture
       * @returns {this}
       */
      unbind() {
          __classPrivateFieldGet(this, _gl$4).bindTexture(__classPrivateFieldGet(this, _gl$4).TEXTURE_2D, null);
          return this;
      }
      /**
       * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} image
       * @param {number} [width]
       * @param {number} [height
       * @returns {this}
       */
      fromImage(image, width = image.width, height = image.height) {
          __classPrivateFieldSet(this, _width, width);
          __classPrivateFieldSet(this, _height, height);
          __classPrivateFieldGet(this, _gl$4).texImage2D(__classPrivateFieldGet(this, _gl$4).TEXTURE_2D, 0, __classPrivateFieldGet(this, _internalFormat), __classPrivateFieldGet(this, _format), __classPrivateFieldGet(this, _type), image);
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
          __classPrivateFieldSet(this, _width, width);
          __classPrivateFieldSet(this, _height, height);
          __classPrivateFieldGet(this, _gl$4).texImage2D(__classPrivateFieldGet(this, _gl$4).TEXTURE_2D, 0, __classPrivateFieldGet(this, _internalFormat), __classPrivateFieldGet(this, _width), __classPrivateFieldGet(this, _height), 0, __classPrivateFieldGet(this, _format), __classPrivateFieldGet(this, _type), null);
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
          __classPrivateFieldSet(this, _width, width);
          __classPrivateFieldSet(this, _height, height);
          __classPrivateFieldGet(this, _gl$4).texImage2D(__classPrivateFieldGet(this, _gl$4).TEXTURE_2D, 0, __classPrivateFieldGet(this, _internalFormat), __classPrivateFieldGet(this, _width), __classPrivateFieldGet(this, _height), 0, __classPrivateFieldGet(this, _format), __classPrivateFieldGet(this, _type), dataArray);
          return this;
      }
      /**
       * @returns {this}
       */
      generateMipmap() {
          __classPrivateFieldGet(this, _gl$4).generateMipmap(__classPrivateFieldGet(this, _gl$4).TEXTURE_2D);
          return this;
      }
      /**
       * @param {GLEnum} [format = gl.RGB]
       * @param {GLEnum} [internalFormat = gl.RGB]
       * @param {GLenum} [type = gl.UNSIGNED_BYTE]
       * @returns {this}
       */
      setFormat(format = __classPrivateFieldGet(this, _gl$4).RGB, internalFormat = __classPrivateFieldGet(this, _gl$4).RGB, type = __classPrivateFieldGet(this, _gl$4).UNSIGNED_BYTE) {
          __classPrivateFieldSet(this, _format, format);
          __classPrivateFieldSet(this, _internalFormat, internalFormat);
          __classPrivateFieldSet(this, _type, type);
          return this;
      }
      /**
       * @returns {this}
       */
      setIsFlip() {
          this.setPixelStore(__classPrivateFieldGet(this, _gl$4).UNPACK_FLIP_Y_WEBGL, true);
          return this;
      }
      /**
       * @param {GLenum} name
       * @param params
       * @returns {this}
       */
      setPixelStore(name, params) {
          __classPrivateFieldGet(this, _gl$4).pixelStorei(name, params);
          return this;
      }
      /**
       * @param {GLenum} [filter = gl.LINEAR]
       * @returns {this}
       */
      setMinFilter(filter = __classPrivateFieldGet(this, _gl$4).LINEAR) {
          __classPrivateFieldGet(this, _gl$4).texParameteri(__classPrivateFieldGet(this, _gl$4).TEXTURE_2D, __classPrivateFieldGet(this, _gl$4).TEXTURE_MIN_FILTER, filter);
          return this;
      }
      /**
       * @param {GLenum} [filter = gl.LINEAR]
       * @returns {this}
       */
      setMagFilter(filter = __classPrivateFieldGet(this, _gl$4).LINEAR) {
          __classPrivateFieldGet(this, _gl$4).texParameteri(__classPrivateFieldGet(this, _gl$4).TEXTURE_2D, __classPrivateFieldGet(this, _gl$4).TEXTURE_MAG_FILTER, filter);
          return this;
      }
      /**
       *
       * @param {GLenum} [wrapS = gl.CLAMP_TO_EDGE]
       * @param {GLenum} [wrapT = gl.CLAMP_TO_EDGE]
       * @returns {this}
       */
      setWrap(wrapS = __classPrivateFieldGet(this, _gl$4).CLAMP_TO_EDGE, wrapT = __classPrivateFieldGet(this, _gl$4).CLAMP_TO_EDGE) {
          __classPrivateFieldGet(this, _gl$4).texParameteri(__classPrivateFieldGet(this, _gl$4).TEXTURE_2D, __classPrivateFieldGet(this, _gl$4).TEXTURE_WRAP_S, wrapS);
          __classPrivateFieldGet(this, _gl$4).texParameteri(__classPrivateFieldGet(this, _gl$4).TEXTURE_2D, __classPrivateFieldGet(this, _gl$4).TEXTURE_WRAP_T, wrapT);
          return this;
      }
      /**
       *
       * @param {number} anisotropyLevel
       * @returns {this}
       */
      setAnisotropy(anisotropyLevel) {
          if (!anisotropyLevel) {
              return;
          }
          if (__classPrivateFieldGet(this, _anisotropyExtension)) {
              const maxAnisotropySupported = __classPrivateFieldGet(this, _gl$4).getParameter(__classPrivateFieldGet(this, _anisotropyExtension).MAX_TEXTURE_MAX_ANISOTROPY_EXT);
              __classPrivateFieldGet(this, _gl$4).texParameterf(__classPrivateFieldGet(this, _gl$4).TEXTURE_2D, __classPrivateFieldGet(this, _anisotropyExtension).TEXTURE_MAX_ANISOTROPY_EXT, anisotropyLevel || maxAnisotropySupported);
          }
          else {
              console.warn('EXT_texture_filter_anisotropic extension is not supported');
          }
          return this;
      }
      delete() {
          __classPrivateFieldGet(this, _gl$4).deleteTexture(__classPrivateFieldGet(this, _texture));
      }
  }
  _gl$4 = new WeakMap(), _texture = new WeakMap(), _width = new WeakMap(), _height = new WeakMap(), _format = new WeakMap(), _internalFormat = new WeakMap(), _type = new WeakMap(), _anisotropyExtension = new WeakMap();
  Texture.isPowerOf2 = (width, height) => isPowerOf2(width) && isPowerOf2(height);

  var _gl$5, _buffer, _depthBuffer, _width$1, _height$1;
  class Framebuffer {
      constructor(gl, { width = gl.canvas.width, height = gl.canvas.height, target = gl.FRAMEBUFFER, wrapS = gl.CLAMP_TO_EDGE, wrapT = gl.CLAMP_TO_EDGE, minFilter = gl.NEAREST, magFilter = gl.NEAREST, format = gl.RGBA, internalFormat = format, type = gl.UNSIGNED_BYTE, depth = true, } = {}) {
          _gl$5.set(this, void 0);
          _buffer.set(this, void 0);
          _depthBuffer.set(this, void 0);
          _width$1.set(this, void 0);
          _height$1.set(this, void 0);
          __classPrivateFieldSet(this, _gl$5, gl);
          __classPrivateFieldSet(this, _width$1, width);
          __classPrivateFieldSet(this, _height$1, height);
          this.texture = new Texture(gl, {
              type,
              format,
              internalFormat,
              wrapS,
              wrapT,
              minFilter,
              magFilter,
          });
          this.texture.bind().fromSize(width, height).unbind();
          __classPrivateFieldSet(this, _buffer, gl.createFramebuffer());
          gl.bindFramebuffer(target, __classPrivateFieldGet(this, _buffer));
          const level = 0;
          const texture = this.texture.getTexture();
          gl.framebufferTexture2D(target, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, level);
          if (depth) {
              __classPrivateFieldSet(this, _depthBuffer, __classPrivateFieldGet(this, _gl$5).createRenderbuffer());
              __classPrivateFieldGet(this, _gl$5).bindRenderbuffer(__classPrivateFieldGet(this, _gl$5).RENDERBUFFER, __classPrivateFieldGet(this, _depthBuffer));
              __classPrivateFieldGet(this, _gl$5).renderbufferStorage(__classPrivateFieldGet(this, _gl$5).RENDERBUFFER, __classPrivateFieldGet(this, _gl$5).DEPTH_COMPONENT16, __classPrivateFieldGet(this, _width$1), __classPrivateFieldGet(this, _height$1));
              __classPrivateFieldGet(this, _gl$5).framebufferRenderbuffer(target, __classPrivateFieldGet(this, _gl$5).DEPTH_ATTACHMENT, __classPrivateFieldGet(this, _gl$5).RENDERBUFFER, __classPrivateFieldGet(this, _depthBuffer));
          }
          gl.bindFramebuffer(target, null);
      }
      bind() {
          __classPrivateFieldGet(this, _gl$5).bindFramebuffer(__classPrivateFieldGet(this, _gl$5).FRAMEBUFFER, __classPrivateFieldGet(this, _buffer));
          return this;
      }
      unbind() {
          __classPrivateFieldGet(this, _gl$5).bindFramebuffer(__classPrivateFieldGet(this, _gl$5).FRAMEBUFFER, null);
          return this;
      }
      reset() {
          this.texture
              .bind()
              .fromSize(__classPrivateFieldGet(this, _width$1), __classPrivateFieldGet(this, _height$1))
              .unbind();
          return this;
      }
      delete() {
          this.texture.delete();
          __classPrivateFieldGet(this, _gl$5).deleteFramebuffer(__classPrivateFieldGet(this, _buffer));
      }
  }
  _gl$5 = new WeakMap(), _buffer = new WeakMap(), _depthBuffer = new WeakMap(), _width$1 = new WeakMap(), _height$1 = new WeakMap();

  class PerspectiveCamera {
      constructor(fieldOfView, aspect, near, far) {
          this.position = [0, 0, 0];
          this.lookAtPosition = [0, 0, 0];
          this.projectionMatrix = create$3();
          this.viewMatrix = create$3();
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

  /**
   * @private
   */
  function buildPlane(vertices, normal, uv, indices, width, height, depth, wSegs, hSegs, u = 0, v = 1, w = 2, uDir = 1, vDir = -1, i = 0, ii = 0) {
      const io = i;
      const segW = width / wSegs;
      const segH = height / hSegs;
      for (let iy = 0; iy <= hSegs; iy++) {
          let y = iy * segH - height / 2;
          for (let ix = 0; ix <= wSegs; ix++, i++) {
              let x = ix * segW - width / 2;
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
              let a = io + ix + iy * (wSegs + 1);
              let b = io + ix + (iy + 1) * (wSegs + 1);
              let c = io + ix + (iy + 1) * (wSegs + 1) + 1;
              let d = io + ix + iy * (wSegs + 1) + 1;
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
  function createBox(params = {}) {
      const { width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1, separateFaces = false, } = params;
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
      const sidesData = [];
      let i = 0;
      let ii = 0;
      {
          // RIGHT
          if (separateFaces) {
              const num = (dSegs + 1) * (hSegs + 1);
              const numIndices = dSegs * hSegs * 6;
              const vertices = new Float32Array(num * 3);
              const normal = new Float32Array(num * 3);
              const uv = new Float32Array(num * 2);
              const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
              buildPlane(vertices, normal, uv, indices, depth, height, width, dSegs, hSegs, 2, 1, 0, -1, -1, i, ii);
              sidesData.push({
                  orientation: 'right',
                  vertices,
                  normal,
                  uv,
                  indices,
              });
          }
          else {
              buildPlane(vertices, normal, uv, indices, depth, height, width, dSegs, hSegs, 2, 1, 0, -1, -1, i, ii);
          }
      }
      {
          // LEFT
          if (separateFaces) {
              const num = (dSegs + 1) * (hSegs + 1);
              const numIndices = dSegs * hSegs * 6;
              const vertices = new Float32Array(num * 3);
              const normal = new Float32Array(num * 3);
              const uv = new Float32Array(num * 2);
              const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
              buildPlane(vertices, normal, uv, indices, depth, height, -width, dSegs, hSegs, 2, 1, 0, 1, -1, i, ii);
              sidesData.push({
                  orientation: 'left',
                  vertices,
                  normal,
                  uv,
                  indices,
              });
          }
          else {
              buildPlane(vertices, normal, uv, indices, depth, height, -width, dSegs, hSegs, 2, 1, 0, 1, -1, (i += (dSegs + 1) * (hSegs + 1)), (ii += dSegs * hSegs));
          }
      }
      {
          // TOP
          if (separateFaces) {
              const num = (dSegs + 1) * (hSegs + 1);
              const numIndices = dSegs * hSegs * 6;
              const vertices = new Float32Array(num * 3);
              const normal = new Float32Array(num * 3);
              const uv = new Float32Array(num * 2);
              const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
              buildPlane(vertices, normal, uv, indices, width, depth, height, dSegs, hSegs, 0, 2, 1, 1, 1, i, ii);
              sidesData.push({
                  orientation: 'top',
                  vertices,
                  normal,
                  uv,
                  indices,
              });
          }
          else {
              buildPlane(vertices, normal, uv, indices, width, depth, height, dSegs, hSegs, 0, 2, 1, 1, 1, (i += (dSegs + 1) * (hSegs + 1)), (ii += dSegs * hSegs));
          }
      }
      {
          // BOTTOM
          if (separateFaces) {
              const num = (dSegs + 1) * (hSegs + 1);
              const numIndices = dSegs * hSegs * 6;
              const vertices = new Float32Array(num * 3);
              const normal = new Float32Array(num * 3);
              const uv = new Float32Array(num * 2);
              const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
              buildPlane(vertices, normal, uv, indices, width, depth, -height, dSegs, hSegs, 0, 2, 1, 1, -1, i, ii);
              sidesData.push({
                  orientation: 'bottom',
                  vertices,
                  normal,
                  uv,
                  indices,
              });
          }
          else {
              buildPlane(vertices, normal, uv, indices, width, depth, -height, dSegs, hSegs, 0, 2, 1, 1, -1, (i += (wSegs + 1) * (dSegs + 1)), (ii += wSegs * dSegs));
          }
      }
      {
          // BACK
          if (separateFaces) {
              const num = (wSegs + 1) * (dSegs + 1);
              const numIndices = wSegs * dSegs * 6;
              const vertices = new Float32Array(num * 3);
              const normal = new Float32Array(num * 3);
              const uv = new Float32Array(num * 2);
              const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
              buildPlane(vertices, normal, uv, indices, width, height, -depth, wSegs, hSegs, 0, 1, 2, -1, -1, i, ii);
              sidesData.push({
                  orientation: 'back',
                  vertices,
                  normal,
                  uv,
                  indices,
              });
          }
          else {
              buildPlane(vertices, normal, uv, indices, width, height, -depth, wSegs, hSegs, 0, 1, 2, -1, -1, (i += (wSegs + 1) * (dSegs + 1)), (ii += wSegs * dSegs));
          }
      }
      {
          // FRONT
          if (separateFaces) {
              const num = (wSegs + 1) * (hSegs + 1);
              const numIndices = wSegs * hSegs * 6;
              const vertices = new Float32Array(num * 3);
              const normal = new Float32Array(num * 3);
              const uv = new Float32Array(num * 2);
              const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
              buildPlane(vertices, normal, uv, indices, width, height, depth, wSegs, hSegs, 0, 1, 2, 1, -1, i, ii);
              sidesData.push({
                  orientation: 'front',
                  vertices,
                  normal,
                  uv,
                  indices,
              });
          }
          else {
              buildPlane(vertices, normal, uv, indices, width, height, depth, wSegs, hSegs, 0, 1, 2, 1, -1, (i += (wSegs + 1) * (hSegs + 1)), (ii += wSegs * hSegs));
          }
      }
      if (separateFaces) {
          return sidesData;
      }
      else {
          return {
              vertices,
              normal,
              uv,
              indices,
          };
      }
  }
  /**
   * Generates geometry data for a fullscreen quad in normalized coordinates
   * @param {SphereInterface} params
   * @returns {{ vertices, uv }}
   */
  function createFullscreenQuad() {
      return {
          vertices: new Float32Array([1, 1, -1, 1, -1, -1, -1, -1, 1, -1, 1, 1]),
          uv: new Float32Array([1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1]),
      };
  }
  /**
   * Generates geometry data for a sphere
   * @param {SphereInterface} params
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
      let te = tStart + tLength;
      const grid = [];
      let n = create$1$1();
      for (let iy = 0; iy <= hSegs; iy++) {
          let vRow = [];
          let v = iy / hSegs;
          for (let ix = 0; ix <= wSegs; ix++, i++) {
              let u = ix / wSegs;
              let x = -radius *
                  Math.cos(pStart + u * pLength) *
                  Math.sin(tStart + v * tLength);
              let y = radius * Math.cos(tStart + v * tLength);
              let z = radius * Math.sin(pStart + u * pLength) * Math.sin(tStart + v * tLength);
              position[i * 3] = x;
              position[i * 3 + 1] = y;
              position[i * 3 + 2] = z;
              set$1(n, x, y, z);
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
              let a = grid[iy][ix + 1];
              let b = grid[iy][ix];
              let c = grid[iy + 1][ix];
              let d = grid[iy + 1][ix + 1];
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

  var index = /*#__PURE__*/Object.freeze({
      __proto__: null,
      createPlane: createPlane,
      createBox: createBox,
      createFullscreenQuad: createFullscreenQuad,
      createSphere: createSphere
  });

  const COUNT_SIDE = 12;
  const BOXES_COUNT = COUNT_SIDE * COUNT_SIDE;
  const BLUR_ITERATIONS = 24;
  const BACKGROUND_COLOR = [0.02, 0.02, 0.02, 1];
  const SCALE_DOWN_POSTFX = 4;

  const OPTS = {
    debugMode: false,
    spread: 3,
    factor: 1.1,
  };

  const gui = new dat.GUI();

  const dpr = devicePixelRatio;
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  const stats = new Stats__default['default']();
  document.body.appendChild(stats.domElement);

  let boxesMesh;
  let sphereMesh;
  let planeMesh;

  // gl.enable(gl.BLEND)
  // gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.depthFunc(gl.LEQUAL);

  const camera = new PerspectiveCamera(
    (45 * Math.PI) / 180,
    innerWidth / innerHeight,
    0.1,
    100,
  );
  camera.position = [0, 0, 10];
  camera.lookAt([0, 0, 0]);

  const renderTargetBlurX = new Framebuffer(gl, {
    width: innerWidth / SCALE_DOWN_POSTFX,
    height: innerHeight / SCALE_DOWN_POSTFX,
  });
  const renderTargetBlurY = new Framebuffer(gl, {
    width: innerWidth / SCALE_DOWN_POSTFX,
    height: innerHeight / SCALE_DOWN_POSTFX,
  });

  /* ----- Instanced Boxes ------ */
  {
    const { indices, vertices, uv } = index.createBox();
    const geometry = new Geometry(gl);
    geometry
      .addIndex({ typedArray: indices })
      .addAttribute('position', {
        typedArray: vertices,
        size: 3,
      })
      .addAttribute('uv', {
        typedArray: uv,
        size: 2,
      });
    boxesMesh = new InstancedMesh(gl, {
      geometry,
      instanceCount: BOXES_COUNT,
      vertexShaderSource: `
    attribute vec4 position;
    attribute vec2 uv;
    attribute mat4 instanceModelMatrix;

    varying vec2 v_uv;

    void main () {
      gl_Position = projectionMatrix *
                    viewMatrix *
                    modelMatrix *
                    instanceModelMatrix *
                    position;
      v_uv = uv;
    }
  `,
      fragmentShaderSource: `
      uniform bool debugMode;
      varying vec2 v_uv;
      void main () {
        if (debugMode) {
          gl_FragColor = vec4(v_uv.x, 0.1, v_uv.y, 1.0);
        } else {
          gl_FragColor = vec4(${BACKGROUND_COLOR.map(
            (color) => `${color}`,
          ).join(', ')});
        }
      }
    `,
    });
  }

  /* ----- Sphere ------ */
  {
    const { indices, vertices } = index.createSphere({
      radius: 2,
      widthSegments: 24,
      heightSegments: 24,
    });
    const geometry = new Geometry(gl);
    geometry.addIndex({ typedArray: indices }).addAttribute('position', {
      typedArray: vertices,
      size: 3,
    });
    sphereMesh = new Mesh(gl, {
      geometry,
      vertexShaderSource: `
      attribute vec4 position;

      void main () {
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
      }
    `,
      fragmentShaderSource: `
      void main () {
        gl_FragColor = vec4(1.0);
      }
    `,
    });
  }

  /* ----- Fullscreen Quad ------ */
  const { vertices, uv } = index.createFullscreenQuad();
  const geometry = new Geometry(gl);
  geometry
    .addAttribute('position', {
      typedArray: vertices,
      size: 2,
    })
    .addAttribute('uv', {
      typedArray: uv,
      size: 2,
    });
  planeMesh = new Mesh(gl, {
    geometry,
    uniforms: {
      diffuse: { type: 'int', value: 0 },
      mask: { type: 'int', value: 1 },
      blurDirection: { type: 'vec2', value: [0, 1] },
      factor: { type: 'float', value: OPTS.factor },
    },
    vertexShaderSource: `
    attribute vec4 position;
    attribute vec2 uv;

    varying vec2 v_uv;

    void main () {
      gl_Position = position;

      v_uv = uv;
    }
  `,
    fragmentShaderSource: `
    uniform sampler2D diffuse;
    uniform sampler2D mask;
    uniform vec2 blurDirection;
    uniform float factor;

    varying vec2 v_uv;

    vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
      vec4 color = vec4(0.0);
      vec2 off1 = vec2(1.3846153846) * direction;
      vec2 off2 = vec2(3.2307692308) * direction;
      color += texture2D(image, uv) * 0.2270270270;
      color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
      color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
      color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
      color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
      return color;
    }

    void main () {
      vec2 resolution = vec2(${innerWidth}.0, ${innerHeight}.0);
      vec4 maskColor = texture2D(mask, v_uv);
      gl_FragColor = mix(
        blur9(diffuse, v_uv, resolution, blurDirection) * factor,
        vec4(0.1, 0.1, 0.1, 1.0),
        maskColor.r
      );
    }
  `,
  });

  const matrix = create();
  const translateVec = create$1();
  const scaleVec = create$2();

  for (let i = 0; i < BOXES_COUNT; i++) {
    const x = (i % COUNT_SIDE) - COUNT_SIDE / 2 + (Math.random() * 2 - 1) * 3;
    const y = (i - x) / COUNT_SIDE - COUNT_SIDE / 2 + (Math.random() * 2 - 1) * 3;
    identity(matrix);
    set(translateVec, x, y, 0);
    translate(matrix, matrix, translateVec);

    const angle = Math.random() * Math.PI * 2;

    rotateX(matrix, matrix, angle);
    rotateZ(matrix, matrix, angle);

    const scale$1 = 0.5 + Math.random() * 0.7;
    set(scaleVec, scale$1, scale$1, scale$1);
    scale(matrix, matrix, scaleVec);
    boxesMesh.setMatrixAt(i, matrix);
  }

  gui.add(OPTS, 'debugMode').onChange((val) => {
    boxesMesh.setUniform('debugMode', 'float', val);
  });
  gui
    .add(OPTS, 'factor')
    .min(1)
    .max(1.15)
    .step(0.01)
    .onChange((val) => {
      planeMesh.setUniform('factor', 'float', val);
    });
  gui.add(OPTS, 'spread').min(1).max(5).step(0.5);

  document.body.appendChild(canvas);
  requestAnimationFrame(updateFrame);
  resize();
  window.addEventListener('resize', resize);

  function updateFrame(ts) {
    ts /= 1000;

    stats.begin();

    let writeBuffer = renderTargetBlurX;
    let readBuffer = renderTargetBlurY;

    if (!OPTS.debugMode) {
      renderTargetBlurX.bind();
      gl.clearColor(...BACKGROUND_COLOR);
      gl.viewport(
        0,
        0,
        innerWidth / SCALE_DOWN_POSTFX,
        innerHeight / SCALE_DOWN_POSTFX,
      );
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    } else {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.clearColor(...BACKGROUND_COLOR);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    sphereMesh
      .setCamera(camera)
      .setPosition({
        x: Math.sin(ts) * 4,
        y: Math.cos(ts) * 3,
        z: -5,
      })
      .draw();

    boxesMesh.setCamera(camera).draw();

    if (!OPTS.debugMode) {
      renderTargetBlurX.unbind();

      for (let i = 0; i < BLUR_ITERATIONS; i++) {
        readBuffer.bind();
        writeBuffer.texture.bind();
        const radius = BLUR_ITERATIONS - i * OPTS.spread - 1;
        planeMesh
          .setUniform(
            'blurDirection',
            'vec2',
            i % 2 === 0 ? [radius, 0] : [0, radius],
          )
          .draw();
        // readBuffer.unbindTexture()

        let t = writeBuffer;
        writeBuffer = readBuffer;
        readBuffer = t;
      }

      writeBuffer.unbind();

      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.clearColor(...BACKGROUND_COLOR);
      // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      readBuffer.texture.bind();

      planeMesh.draw();
    }

    // readBuffer.unbindTexture()

    stats.end();

    requestAnimationFrame(updateFrame);
  }

  function resize() {
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.setProperty('width', `${innerWidth}px`);
    canvas.style.setProperty('height', `${innerHeight}px`);
  }

}(Stats, dat));
