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

  function create$2() {
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

  function normalize$1(out, a) {
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
          this.modelMatrix = create$2();
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
          scale(this.modelMatrix, this.modelMatrix, __classPrivateFieldGet(this, _scaleVec3));
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
          const identityMat = create$2();
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
   * Clamp number to a given range
   * @param {num}
   * @param {min}
   * @param {max}
   * @returns {number}
   */
  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

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
      constructor(camera, domElement = document.body) {
          this.target = create$1$1();
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
          this.originTarget = create$1$1();
          this.originPosition = create$1$1();
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
          const xDir = create$1$1();
          const yDir = create$1$1();
          const zDir = create$1$1();
          zDir[0] = this.target[0] - this.camera.position[0];
          zDir[1] = this.target[1] - this.camera.position[1];
          zDir[2] = this.target[2] - this.camera.position[2];
          normalize$1(zDir, zDir);
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
          this.projectionMatrix = create$2();
          this.viewMatrix = create$2();
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

  /* TAKEN FROM https://www.patreon.com/posts/raw-gltf-parsing-28395927 */

  class GLTF {
    /**
     * Returns the geometry data for all the primatives that make up a Mesh based on the name
     * that the mesh appears in the nodes list.
     * @param {string} name - Name of a node in the GLTF Json file
     * @param {object} json - GLTF Json Object
     * @param {ArrayBuffer} bin - Array buffer of a bin file
     * @public @return {Array.{name,mode,position,vertices,normal,uv,weights,joints}}
     */
    static getMesh(name, json, bin) {
      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      // Find Mesh to parse out.
      var i,
        nn,
        n = null;
      for (i = 0; i < json.nodes.length; i++) {
        nn = json.nodes[i];
        if (nn.name === name && nn.mesh != undefined) {
          n = nn;
          break
        }
      }

      if (!n) {
        console.error('Node by the name', name, 'not found in GLTF Node Array');
        return null
      }

      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      // Loop through all the primatives that make up a single mesh
      var m = json.meshes[n.mesh],
        ary = new Array(m.primitives.length),
        itm,
        prim,
        attr;

      for (var i = 0; i < m.primitives.length; i++) {
        //.......................................
        // Setup some vars
        prim = m.primitives[i];
        attr = prim.attributes;
        itm = {
          name: name + '_p' + i,
          mode: prim.mode != undefined ? prim.mode : GLTF.MODE_TRIANGLES,
        };

        //.......................................
        // Save Position, Rotation and Scale if Available.
        if (n.translation) itm.position = n.translation.slice(0);
        if (n.rotation) itm.rotation = n.rotation.slice(0);
        if (n.scale) itm.scale = n.scale.slice(0);

        //.......................................
        // Parse out all the raw Geometry Data from the Bin file
        itm.vertices = GLTF.parseAccessor(attr.POSITION, json, bin);
        if (prim.indices != undefined)
          itm.indices = GLTF.parseAccessor(prim.indices, json, bin);
        if (attr.NORMAL != undefined)
          itm.normal = GLTF.parseAccessor(attr.NORMAL, json, bin);
        if (attr.TEXCOORD_0 != undefined)
          itm.uv = GLTF.parseAccessor(attr.TEXCOORD_0, json, bin);
        if (attr.WEIGHTS_0 != undefined)
          itm.weights = GLTF.parseAccessor(attr.WEIGHTS_0, json, bin);
        if (attr.JOINTS_0 != undefined)
          itm.joints = GLTF.parseAccessor(attr.JOINTS_0, json, bin);

        //.......................................
        // Save to return array
        ary[i] = itm;
      }

      return ary
    }

    /**
     * Parse out a single buffer of data from the bin file based on an accessor index. (Vertices, Normal, etc)
     * @param {number} idx - Index of an Accessor
     * @param {object} json - GLTF Json Object
     * @param {ArrayBuffer} bin - Array buffer of a bin file
     * @public @return {data:TypeArray, min, max, elmCount, compLen}
     */
    static parseAccessor(idx, json, bin) {
      var acc = json.accessors[idx], // Reference to Accessor JSON Element
        bView = json.bufferViews[acc.bufferView], // Buffer Information
        compLen = GLTF['COMP_' + acc.type], // Component Length for Data Element
        ary = null, // Final Type array that will be filled with data
        TAry, // Reference to Type Array to create
        DFunc; // Reference to GET function in Type Array

      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      // Figure out which Type Array we need to save the data in
      switch (acc.componentType) {
        case GLTF.TYPE_FLOAT:
          TAry = Float32Array;
          DFunc = 'getFloat32';
          break
        case GLTF.TYPE_SHORT:
          TAry = Int16Array;
          DFunc = 'getInt16';
          break
        case GLTF.TYPE_UNSIGNED_SHORT:
          TAry = Uint16Array;
          DFunc = 'getUint16';
          break
        case GLTF.TYPE_UNSIGNED_INT:
          TAry = Uint32Array;
          DFunc = 'getUint32';
          break
        case GLTF.TYPE_UNSIGNED_BYTE:
          TAry = Uint8Array;
          DFunc = 'getUint8';
          break

        default:
          console.log(
            'ERROR processAccessor',
            'componentType unknown',
            a.componentType,
          );
          return null
      }

      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      // Data is Interlaced
      if (bView.byteStride) {
        var stride = bView.byteStride, // Stride Length in bytes
          elmCnt = acc.count, // How many stride elements exist.
          bOffset = bView.byteOffset || 0, // Buffer Offset
          sOffset = acc.byteOffset || 0, // Stride Offset
          bPer = TAry.BYTES_PER_ELEMENT, // How many bytes to make one value of the data type
          aryLen = elmCnt * compLen, // How many "floats/ints" need for this array
          dView = new DataView(bin), // Access to Binary Array Buffer
          p = 0, // Position Index of Byte Array
          j = 0, // Loop Component Length ( Like a Vec3 at a time )
          k = 0; // Position Index of new Type Array

        ary = new TAry(aryLen); //Final Array

        //Loop for each element of by stride
        for (var i = 0; i < elmCnt; i++) {
          // Buffer Offset + (Total Stride * Element Index) + Sub Offset within Stride Component
          p = bOffset + stride * i + sOffset; //Calc Starting position for the stride of data

          //Then loop by compLen to grab stuff out of the DataView and into the Typed Array
          for (j = 0; j < compLen; j++)
            ary[k++] = dView[DFunc](p + j * bPer, true);
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Data is NOT interlaced
        // https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#data-alignment
        // TArray example from documentation works pretty well for data that is not interleaved.
      } else {
        var bOffset = (acc.byteOffset || 0) + (bView.byteOffset || 0),
          elmCnt = acc.count;

        ary = new TAry(bin, bOffset, elmCnt * compLen);
      }

      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      return {
        data: ary,
        min: acc.min,
        max: acc.max,
        elmCount: acc.count,
        compLen: GLTF['COMP_' + acc.type],
      }
    }
  }

  ////////////////////////////////////////////////////////
  // CONSTANTS
  ////////////////////////////////////////////////////////
  GLTF.MODE_POINTS = 0; //Mode Constants for GLTF and WebGL are identical
  GLTF.MODE_LINES = 1; //https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants
  GLTF.MODE_LINE_LOOP = 2;
  GLTF.MODE_LINE_STRIP = 3;
  GLTF.MODE_TRIANGLES = 4;
  GLTF.MODE_TRIANGLE_FAN = 6;

  GLTF.TYPE_BYTE = 5120;
  GLTF.TYPE_UNSIGNED_BYTE = 5121;
  GLTF.TYPE_SHORT = 5122;
  GLTF.TYPE_UNSIGNED_SHORT = 5123;
  GLTF.TYPE_UNSIGNED_INT = 5125;
  GLTF.TYPE_FLOAT = 5126;

  GLTF.COMP_SCALAR = 1;
  GLTF.COMP_VEC2 = 2;
  GLTF.COMP_VEC3 = 3;
  GLTF.COMP_VEC4 = 4;
  GLTF.COMP_MAT2 = 4;
  GLTF.COMP_MAT3 = 9;
  GLTF.COMP_MAT4 = 16;

  const MOBILE_VIEWPORT = 420;

  const INSTANCE_COUNT_X = 4;
  const INSTANCE_COUNT_Y = 4;
  const INSTANCE_COUNT_Z = 8;
  const INSTANCE_COUNT = INSTANCE_COUNT_X * INSTANCE_COUNT_Y * INSTANCE_COUNT_Z;
  const FOG_COLOR = [0.9, 0.9, 0.9, 1];

  const vertexShaderSource = `
  uniform float time;

  attribute vec4 position;
  attribute vec3 normal;
  attribute mat4 instanceModelMatrix;
  attribute vec3 color;

  varying vec3 v_normal;
  varying vec3 v_color;
  varying float v_fogDepth;
  varying vec3 v_position;

  void main () {
    vec4 offsetPosition = instanceModelMatrix * position;
    offsetPosition.y += sin(instanceModelMatrix[3][2] * 10.0 + time) * 1.0;

    vec4 worldViewPosition = viewMatrix * modelMatrix * offsetPosition;

    gl_Position = projectionMatrix * worldViewPosition;

    v_normal = mat3(modelMatrix) * normal;
    v_color = color;
    v_fogDepth = -(worldViewPosition).z;
    v_position = worldViewPosition.xyz;
  }
`;
  const getFragmentShaderSource = (isLinearFog = true) => `
  uniform vec3 lightDirection;
  uniform vec4 fogColor;
  uniform float fogNear;
  uniform float fogFar;
  uniform float fogDensity;

  varying vec3 v_normal;
  varying vec3 v_color;
  varying float v_fogDepth;
  varying vec3 v_position;

  void main () {
    vec3 normal = normalize(v_normal);
    float light = dot(normal, lightDirection);

    ${
      isLinearFog
        ? `
        float fogAmount = smoothstep(fogNear, fogFar, v_fogDepth);
      `
        : `
        #define LOG2 1.442695
        float fogDistance = length(v_position);
        float fogAmount = 1.0 - exp2(-fogDensity * fogDensity * fogDistance * fogDistance * LOG2);
        fogAmount = clamp(fogAmount, 0.0, 1.0);
      `
    }

    gl_FragColor = vec4(v_color, 1.0);
    gl_FragColor.rgb *= light;
    gl_FragColor = mix(gl_FragColor, fogColor, fogAmount);
  }
`;

  const OPTIONS = {
    isExponentialFog: false,
    fogNear: 0,
    fogFar: 70,
    fogDensity: 0.032,
  };

  const gui = new dat.GUI();

  const stats = new Stats__default['default']();
  document.body.appendChild(stats.domElement);

  const dpr = devicePixelRatio;
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  const transformMatrix = create();
  const translateVec3 = create$1();

  document.getElementById('gltf-info');
  let gJson;
  let gBin;
  let gltfMesh;
  let gltfMesh2;

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.SCISSOR_TEST);

  const camera = new PerspectiveCamera(
    (45 * Math.PI) / 180,
    innerWidth / innerHeight,
    0.1,
    100,
  );
  camera.position = [0, 0, 10];
  camera.lookAt([0, 0, 0]);

  const lightDirection = create$1();
  set(lightDirection, 1, 1, 1);
  normalize(lightDirection, lightDirection);

  new CameraController(camera, canvas);

  downloadFile('/assets/models/Suzanne.gltf', 'json', loadModel);
  downloadFile('/assets/models/Suzanne.bin', 'arraybuffer', loadModel);

  const linearFolder = gui.addFolder('linear fog');
  linearFolder.open();
  // linearFolder
  //   .add(OPTIONS, 'fogNear')
  //   .min(0)
  //   .max(10)
  //   .step(1)
  //   .onChange((val) => gltfMesh.setUniform('fogNear', 'float', val))
  linearFolder
    .add(OPTIONS, 'fogFar')
    .min(0)
    .max(150)
    .step(1)
    .onChange((val) => gltfMesh.setUniform('fogFar', 'float', val));

  const exponentialFolder = gui.addFolder('exponential squared fog');
  exponentialFolder.open();
  exponentialFolder
    .add(OPTIONS, 'fogDensity')
    .min(0)
    .max(0.225)
    .step(0.001)
    .onChange((val) => gltfMesh2.setUniform('fogDensity', 'float', val));

  const sharedUniforms = {
    time: { type: 'float', value: 0 },
    lightDirection: { type: 'vec3', value: lightDirection },
    fogColor: { type: 'vec4', value: FOG_COLOR },
    fogNear: { type: 'float', value: OPTIONS.fogNear },
    fogFar: { type: 'float', value: OPTIONS.fogFar },
    fogDensity: { type: 'float', value: OPTIONS.fogDensity },
  };

  document.body.appendChild(canvas);
  requestAnimationFrame(updateFrame);
  resize();
  window.addEventListener('resize', resize);

  function loadModel(xhr) {
    if (xhr.responseType === 'json') {
      gJson = xhr.response;
    } else if (xhr.responseType === 'arraybuffer') {
      gBin = xhr.response;
    }
    if (!gJson || !gBin) {
      return
    }
    const meshName = 'Suzanne';
    const prim = GLTF.getMesh(meshName, gJson, gBin);

    const indices = prim[0].indices.data;
    const vertices = prim[0].vertices.data;
    const uvs = prim[0].uv.data;
    const normals = prim[0].normal.data;

    const colors = new Float32Array(INSTANCE_COUNT * 3);

    for (let i = 0; i < indices.length; i++) {
      colors[i * 3 + 0] = Math.random();
      colors[i * 3 + 1] = Math.random();
      colors[i * 3 + 2] = Math.random();
    }

    const geometry = new Geometry(gl);
    geometry
      .addIndex({
        typedArray: indices,
      })
      .addAttribute('position', {
        typedArray: vertices,
        size: 3,
      })
      .addAttribute('uv', {
        typedArray: uvs,
        size: 2,
      })
      .addAttribute('normal', {
        typedArray: normals,
        size: 3,
      })
      .addAttribute('color', {
        typedArray: colors,
        size: 3,
        instancedDivisor: 1,
      });

    gltfMesh = new InstancedMesh(gl, {
      geometry,
      instanceCount: INSTANCE_COUNT,
      uniforms: {
        ...sharedUniforms,
      },
      vertexShaderSource,
      fragmentShaderSource: getFragmentShaderSource(true),
    });

    gltfMesh2 = new InstancedMesh(gl, {
      geometry,
      instanceCount: INSTANCE_COUNT,
      uniforms: {
        ...sharedUniforms,
      },
      vertexShaderSource,
      fragmentShaderSource: getFragmentShaderSource(false),
    });

    let i = 0;
    const scaleX = 5;
    const scaleY = 5;
    const scaleZ = 10;
    for (let x = 0; x < INSTANCE_COUNT_X; x++) {
      for (let y = 0; y < INSTANCE_COUNT_Y; y++) {
        for (let z = 0; z < INSTANCE_COUNT_Z; z++) {
          identity(transformMatrix);
          set(
            translateVec3,
            x * scaleX - (INSTANCE_COUNT_X * scaleX - scaleX) / 2,
            y * scaleY - (INSTANCE_COUNT_Y * scaleY - scaleY) / 2,
            -z * scaleZ,
          );
          translate(transformMatrix, transformMatrix, translateVec3);
          gltfMesh.setMatrixAt(i, transformMatrix);
          gltfMesh2.setMatrixAt(i, transformMatrix);
          i++;
        }
      }
    }
  }

  function updateFrame(ts) {
    ts /= 1000;

    stats.begin();

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(...FOG_COLOR);
    if (innerWidth < MOBILE_VIEWPORT) {
      gl.scissor(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight / 2);
    } else {
      gl.scissor(0, 0, gl.drawingBufferWidth / 2, gl.drawingBufferHeight);
    }
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (gltfMesh) {
      gltfMesh.setUniform('time', 'float', ts).setCamera(camera).draw();
    }

    if (innerWidth < MOBILE_VIEWPORT) {
      gl.scissor(
        0,
        gl.drawingBufferHeight / 2,
        gl.drawingBufferWidth,
        gl.drawingBufferHeight / 2,
      );
    } else {
      gl.scissor(
        gl.drawingBufferWidth / 2,
        0,
        gl.drawingBufferWidth,
        gl.drawingBufferHeight,
      );
    }
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (gltfMesh2) {
      gltfMesh2.setUniform('time', 'float', ts).setCamera(camera).draw();
    }

    stats.end();

    requestAnimationFrame(updateFrame);
  }

  function resize() {
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.setProperty('width', `${innerWidth}px`);
    canvas.style.setProperty('height', `${innerHeight}px`);
  }

  function downloadFile(url, type, callback) {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener(
      'load',
      (e) => {
        callback(xhr);
      },
      false,
    );
    xhr.addEventListener(
      'error',
      (e) => {
        // ...
      },
      false,
    );
    xhr.addEventListener(
      'abort',
      (e) => {
        // ...
      },
      false,
    );
    xhr.addEventListener(
      'timeout',
      (e) => {
        // ...
      },
      false,
    );

    xhr.open('GET', url);
    xhr.responseType = type;

    try {
      xhr.send();
    } catch (err) {
      console.error(`Could not send XHR: ${err}`);
    }
  }

}(Stats, dat));
