(function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var stats_min = createCommonjsModule(function (module, exports) {
	!function(e,t){module.exports=t();}(commonjsGlobal,function(){var c=function(){var n=0,l=document.createElement("div");function e(e){return l.appendChild(e.dom),e}function t(e){for(var t=0;t<l.children.length;t++)l.children[t].style.display=t===e?"block":"none";n=e;}l.style.cssText="position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000",l.addEventListener("click",function(e){e.preventDefault(),t(++n%l.children.length);},!1);var i=(performance||Date).now(),a=i,o=0,f=e(new c.Panel("FPS","#0ff","#002")),r=e(new c.Panel("MS","#0f0","#020"));if(self.performance&&self.performance.memory)var d=e(new c.Panel("MB","#f08","#201"));return t(0),{REVISION:16,dom:l,addPanel:e,showPanel:t,begin:function(){i=(performance||Date).now();},end:function(){o++;var e=(performance||Date).now();if(r.update(e-i,200),a+1e3<=e&&(f.update(1e3*o/(e-a),100),a=e,o=0,d)){var t=performance.memory;d.update(t.usedJSHeapSize/1048576,t.jsHeapSizeLimit/1048576);}return e},update:function(){i=this.end();},domElement:l,setMode:t}};return c.Panel=function(n,l,i){var a=1/0,o=0,f=Math.round,r=f(window.devicePixelRatio||1),d=80*r,e=48*r,c=3*r,p=2*r,u=3*r,s=15*r,m=74*r,h=30*r,y=document.createElement("canvas");y.width=d,y.height=e,y.style.cssText="width:80px;height:48px";var v=y.getContext("2d");return v.font="bold "+9*r+"px Helvetica,Arial,sans-serif",v.textBaseline="top",v.fillStyle=i,v.fillRect(0,0,d,e),v.fillStyle=l,v.fillText(n,c,p),v.fillRect(u,s,m,h),v.fillStyle=i,v.globalAlpha=.9,v.fillRect(u,s,m,h),{dom:y,update:function(e,t){a=Math.min(a,e),o=Math.max(o,e),v.fillStyle=i,v.globalAlpha=1,v.fillRect(0,0,d,s),v.fillStyle=l,v.fillText(f(e)+" "+n+" ("+f(a)+"-"+f(o)+")",c,p),v.drawImage(y,u+r,s,m-r,h,u,s,m-r,h),v.fillRect(u+m-r,s,r,h),v.fillStyle=i,v.globalAlpha=.9,v.fillRect(u+m-r,s,r,f((1-e/t)*h));}}},c});
	});

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

	function create$1() {
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
	        this.modelMatrix = create$1();
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
	        set(__classPrivateFieldGet(this, _scaleVec3), __classPrivateFieldGet(this, _scale)[0], __classPrivateFieldGet(this, _scale)[1], __classPrivateFieldGet(this, _scale)[2]);
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
	        set(__classPrivateFieldGet(this, _positionVec3), x, y, z);
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
	        set(__classPrivateFieldGet(this, _scaleVec3), x, y, z);
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
	        set(__classPrivateFieldGet(this, _rotationAxisVec3), x, y, z);
	        __classPrivateFieldSet(this, _rotationAngle, rotationAngle);
	        this.modelMatrixNeedsUpdate = true;
	        return this;
	    }
	    /**
	     * Update model matrix with scale, rotation and translation
	     * @returns {this}
	     */
	    updateModelMatrix() {
	        identity(this.modelMatrix);
	        translate(this.modelMatrix, this.modelMatrix, __classPrivateFieldGet(this, _positionVec3));
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

	const VERTEX_SHADER_UPDATE_POSITIONS = `
  attribute vec4 position;

  void main () {
    gl_Position = position;
  }
`;

	const FRAGMENT_SHADER_UPDATE_POSITIONS = `
  uniform sampler2D positionsTexture;
  uniform sampler2D velocitiesTexture;
  uniform vec2 textureDimensions;
  uniform vec2 canvasDimensions;
  uniform vec3 mousePos;
  uniform float deltaTime;

  vec2 euclideanModulo(vec2 n, vec2 m) {
    return mod(mod(n, m) + m, m);
  }

  void main () {
    vec2 texCoords = gl_FragCoord.xy / textureDimensions;
    vec2 position = texture2D(positionsTexture, texCoords).xy;
    vec2 velocity = texture2D(velocitiesTexture, texCoords).xy;
    vec2 newPosition = euclideanModulo(position + velocity * deltaTime, canvasDimensions);

    float dist = distance(position, mousePos.xy);
    float maxDist = mousePos.z;

    newPosition.x -= (maxDist - clamp(dist, -maxDist, maxDist)) * velocity.x * 0.1;
    newPosition.y -= (maxDist - clamp(dist, -maxDist, maxDist)) * velocity.y * 0.1;

    gl_FragColor = vec4(newPosition, 1, 1);
  }
`;

	const VERTEX_SHADER_PARTICLES = `
  attribute vec4 position;
  
  uniform sampler2D positionsTexture;
  uniform vec2 textureDimensions;

  vec4 getValFromTextureArray (sampler2D texture, vec2 dimensions, float index) {
    float y = floor(index / dimensions.x);
    float x = mod(index, dimensions.x);
    vec2 texCoords = (vec2(x, y) + 0.5) / dimensions;
    return texture2D(texture, texCoords);
  }

  void main () {
    float id = position.x;
    vec4 newPos = getValFromTextureArray(positionsTexture, textureDimensions, id);
    gl_Position = projectionMatrix * vec4(newPos.xy, 0, 1);
    gl_PointSize = 2.0;
  }
`;

	const FRAGMENT_SHADER_PARTICLES = `
  void main () {
    gl_FragColor = vec4(vec3(0.4), 1.0);
  }
`;

	const stats = new stats_min();
	document.body.appendChild(stats.domElement);

	const dpr = devicePixelRatio;
	const canvas = document.createElement('canvas');
	const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
	const errorLogWrapper = document.getElementById('error-log');
	const infoLogWrapper = document.getElementById('info-log');
	// const webglLint = getExtension(gl, 'GMAN_debug_helper')

	checkExtensionsSupport();

	const orthoProjectionMatrix = create();
	{
	  const left = 0;
	  const right = innerWidth;
	  const bottom = 0;
	  const top = innerHeight;
	  const near = -1;
	  const far = 1;
	  ortho(orthoProjectionMatrix, left, right, bottom, top, near, far);
	}

	const particleTexWidth = 500;
	const particleTexHeight = 500;
	const numParticles = particleTexWidth * particleTexHeight;

	infoLogWrapper.innerText = `Rendering ${humanizeNumber(numParticles)} particles`;

	const ids = new Array(numParticles).fill().map((_, i) => i);
	const positions = new Float32Array(
	  ids.map((_) => [rand(innerWidth), rand(innerHeight), 0, 0]).flat(),
	);
	const velocities = new Float32Array(
	  ids.map((_) => [rand(-300, 300), rand(-300, 300), 0, 0]).flat(),
	);

	const velicityTexture = new Texture(gl, {
	  format: gl.RGBA,
	  internalFormat: gl.RGBA,
	  type: gl.FLOAT,
	});
	// webglLint.tagObject(velicityTexture.getTexture(), 'velocity textiure')
	velicityTexture
	  .bind()
	  .fromData(velocities, particleTexWidth, particleTexHeight)
	  .unbind();

	// const velicityTexture = new Texture(gl, {
	//   image: velocities,
	//   width: particleTexWidth,
	//   height: particleTexHeight,
	//   format: gl.RGBA,
	//   internalFormat: gl.RGBA,
	//   minFilter: gl.NEAREST,
	//   magFilter: gl.NEAREST,
	//   type: gl.FLOAT,
	// })
	// const positionTex1 = new Texture(gl, {
	//   image: positions,
	//   width: particleTexWidth,
	//   height: particleTexHeight,
	//   format: gl.RGBA,
	//   internalFormat: gl.RGBA,
	//   minFilter: gl.NEAREST,
	//   magFilter: gl.NEAREST,
	//   type: gl.FLOAT,
	// })
	// const positionTex2 = new Texture(gl, {
	//   image: null,
	//   width: particleTexWidth,
	//   height: particleTexHeight,
	//   format: gl.RGBA,
	//   internalFormat: gl.RGBA,
	//   minFilter: gl.NEAREST,
	//   magFilter: gl.NEAREST,
	//   type: gl.FLOAT,
	// })

	const positionTex1 = new Texture(gl, {
	  format: gl.RGBA,
	  internalFormat: gl.RGBA,
	  type: gl.FLOAT,
	});
	// webglLint.tagObject(positionTex1.getTexture(), 'position 1')
	positionTex1
	  .bind()
	  .fromData(positions, particleTexWidth, particleTexHeight)
	  .unbind();

	const positionTex2 = new Texture(gl, {
	  format: gl.RGBA,
	  internalFormat: gl.RGBA,
	  type: gl.FLOAT,
	});
	// webglLint.tagObject(positionTex2.getTexture(), 'position 2')
	positionTex2.bind().fromSize(particleTexWidth, particleTexHeight).unbind();

	// const positionTex1 = new Texture(gl, {
	//   image: positions,
	//   width: particleTexWidth,
	//   height: particleTexHeight,
	//   format: gl.RGBA,
	//   internalFormat: gl.RGBA,
	//   minFilter: gl.NEAREST,
	//   magFilter: gl.NEAREST,
	//   type: gl.FLOAT,
	// })

	const positionsFB1 = createFramebuffer(gl, positionTex1.getTexture());
	const positionsFB2 = createFramebuffer(gl, positionTex2.getTexture());

	let oldTime = 0;
	let oldPositionsInfo = {
	  fb: positionsFB1,
	  tex: positionTex1.getTexture(),
	};
	let newPositionsInfo = {
	  fb: positionsFB2,
	  tex: positionTex2.getTexture(),
	};

	let updatePositionsMesh;
	let drawMesh;
	let oldMouseX = innerWidth / 2;
	let oldMouseY = innerHeight / 2;

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.DEPTH_TEST);

	{
	  const { vertices } = index.createFullscreenQuad();
	  const geometry = new Geometry(gl);
	  geometry.addAttribute('position', { typedArray: vertices, size: 2 });

	  const textureDimensions = [particleTexWidth, particleTexHeight];
	  const canvasDimensions = [innerWidth, innerHeight];
	  updatePositionsMesh = new Mesh(gl, {
	    geometry,
	    uniforms: {
	      positionsTexture: { type: 'int', value: 0 },
	      velocitiesTexture: { type: 'int', value: 1 },
	      textureDimensions: { type: 'vec2', value: textureDimensions },
	      canvasDimensions: { type: 'vec2', value: canvasDimensions },
	      mousePos: { type: 'vec3', value: [innerWidth / 2, innerHeight / 2, 40] },
	      deltaTime: { type: 'float', value: 0 },
	    },
	    vertexShaderSource: VERTEX_SHADER_UPDATE_POSITIONS,
	    fragmentShaderSource: FRAGMENT_SHADER_UPDATE_POSITIONS,
	  });
	}

	{
	  const geometry = new Geometry(gl);
	  geometry.addAttribute('position', {
	    typedArray: new Float32Array(ids),
	    size: 1,
	  });
	  const textureDimensions = [particleTexWidth, particleTexHeight];
	  drawMesh = new Mesh(gl, {
	    geometry,
	    uniforms: {
	      positionsTexture: { type: 'int', value: 0 },
	      textureDimensions: { type: 'vec2', value: textureDimensions },
	      projectionMatrix: { type: 'mat4', value: orthoProjectionMatrix },
	    },
	    vertexShaderSource: VERTEX_SHADER_PARTICLES,
	    fragmentShaderSource: FRAGMENT_SHADER_PARTICLES,
	  });
	  drawMesh.drawMode = 0;
	}

	document.body.appendChild(canvas);
	requestAnimationFrame(updateFrame);
	resize();
	window.addEventListener('resize', resize);
	document.addEventListener('mousemove', (e) => {
	  const dx = Math.min(e.pageX - oldMouseX, 100);
	  const dy = Math.min(e.pageY - oldMouseY, 100);
	  const dist = Math.sqrt(dx * dx + dy * dy);
	  console.log(dx, dy);
	  oldMouseX = e.pageX;
	  oldMouseY = e.pageY;
	  updatePositionsMesh.setUniform('mousePos', 'vec3', [
	    e.pageX,
	    innerHeight - e.pageY,
	    dist + 20,
	  ]);
	});

	function updateFrame(ts) {
	  ts /= 4000;
	  const dt = ts - oldTime;
	  oldTime = ts;

	  stats.begin();
	  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	  gl.clearColor(0.9, 0.9, 0.9, 1);
	  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	  // gl.viewport(0, 0, particleTexWidth, particleTexHeight)
	  // gl.activeTexture(gl.TEXTURE0)
	  // gl.bindTexture(gl.TEXTURE_2D, oldPositionsInfo.tex)
	  // gl.activeTexture(gl.TEXTURE0 + 1)
	  // gl.bindTexture(gl.TEXTURE_2D, velicityTexture.texture)

	  // updatePositionsMesh.setUniform('deltaTime', 'float', dt).draw()

	  gl.bindFramebuffer(gl.FRAMEBUFFER, newPositionsInfo.fb);
	  gl.viewport(0, 0, particleTexWidth, particleTexHeight);

	  gl.activeTexture(gl.TEXTURE0);
	  gl.bindTexture(gl.TEXTURE_2D, oldPositionsInfo.tex);
	  gl.activeTexture(gl.TEXTURE0 + 1);
	  gl.bindTexture(gl.TEXTURE_2D, velicityTexture.getTexture());

	  updatePositionsMesh.setUniform('deltaTime', 'float', dt).draw();

	  // {
	  //   const results = new Uint8Array(particleTexWidth * particleTexHeight * 4)
	  //   gl.readPixels(
	  //     0,
	  //     0,
	  //     particleTexWidth,
	  //     particleTexHeight,
	  //     gl.RGBA,
	  //     gl.FLOAT,
	  //     results,
	  //   )
	  //   debugger
	  // }

	  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	  gl.activeTexture(gl.TEXTURE0);
	  gl.bindTexture(gl.TEXTURE_2D, newPositionsInfo.tex);

	  drawMesh.draw();

	  {
	    const temp = oldPositionsInfo;
	    oldPositionsInfo = newPositionsInfo;
	    newPositionsInfo = temp;
	  }
	  stats.end();

	  requestAnimationFrame(updateFrame);
	}

	function rand(min, max) {
	  if (max === undefined) {
	    max = min;
	    min = 0;
	  }
	  return Math.random() * (max - min) + min
	}

	function resize() {
	  canvas.width = innerWidth * dpr;
	  canvas.height = innerHeight * dpr;
	  canvas.style.setProperty('width', `${innerWidth}px`);
	  canvas.style.setProperty('height', `${innerHeight}px`);
	}

	function createFramebuffer(gl, tex) {
	  const fb = gl.createFramebuffer();
	  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
	  gl.framebufferTexture2D(
	    gl.FRAMEBUFFER,
	    gl.COLOR_ATTACHMENT0,
	    gl.TEXTURE_2D,
	    tex,
	    0,
	  );
	  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	  return fb
	}

	function checkExtensionsSupport() {
	  // check we can use floating point textures
	  const ext1 = getExtension(gl, 'OES_texture_float');
	  if (!ext1) {
	    errorLogWrapper.innerHTML += `
    <p>⚠️ Need OES_texture_float</p>
  `;
	  }
	  // check we can render to floating point textures
	  const ext2 = getExtension(gl, 'WEBGL_color_buffer_float');
	  if (!ext2) {
	    errorLogWrapper.innerHTML += `
    <p>⚠️ Need WEBGL_color_buffer_float</p>
  `;
	  }
	  // check we can use textures in a vertex shader
	  if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) < 1) {
	    errorLogWrapper.innerHTML += `
    <p>⚠️ Can not use textures in vertex shaders</p>
  `;
	  }
	}

	function humanizeNumber(number, { digits = 0 } = {}) {
	  const THOUSAND = 1000;
	  const MILLION = 1000000;
	  const BILLION = 1000000000;

	  const roundingBase = Math.pow(10, digits);
	  if (number > BILLION) {
	    return `${Math.round((number / BILLION) * roundingBase) / roundingBase}mrd`
	  }
	  if (number > MILLION) {
	    return `${Math.round((number / MILLION) * roundingBase) / roundingBase}m`
	  }
	  if (number > THOUSAND) {
	    return `${Math.round((number / THOUSAND) * roundingBase) / roundingBase}k`
	  }
	}

}());
