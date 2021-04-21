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
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */

	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/** Used as references for various `Number` constants. */
	var NAN = 0 / 0;

	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';

	/** Used to match leading and trailing whitespace. */
	var reTrim = /^\s+|\s+$/g;

	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

	/** Used to detect binary string values. */
	var reIsBinary = /^0b[01]+$/i;

	/** Used to detect octal string values. */
	var reIsOctal = /^0o[0-7]+$/i;

	/** Built-in method references without a dependency on `root`. */
	var freeParseInt = parseInt;

	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max,
	    nativeMin = Math.min;

	/**
	 * Gets the timestamp of the number of milliseconds that have elapsed since
	 * the Unix epoch (1 January 1970 00:00:00 UTC).
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Date
	 * @returns {number} Returns the timestamp.
	 * @example
	 *
	 * _.defer(function(stamp) {
	 *   console.log(_.now() - stamp);
	 * }, _.now());
	 * // => Logs the number of milliseconds it took for the deferred invocation.
	 */
	var now = function() {
	  return root.Date.now();
	};

	/**
	 * Creates a debounced function that delays invoking `func` until after `wait`
	 * milliseconds have elapsed since the last time the debounced function was
	 * invoked. The debounced function comes with a `cancel` method to cancel
	 * delayed `func` invocations and a `flush` method to immediately invoke them.
	 * Provide `options` to indicate whether `func` should be invoked on the
	 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
	 * with the last arguments provided to the debounced function. Subsequent
	 * calls to the debounced function return the result of the last `func`
	 * invocation.
	 *
	 * **Note:** If `leading` and `trailing` options are `true`, `func` is
	 * invoked on the trailing edge of the timeout only if the debounced function
	 * is invoked more than once during the `wait` timeout.
	 *
	 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
	 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
	 *
	 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
	 * for details over the differences between `_.debounce` and `_.throttle`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to debounce.
	 * @param {number} [wait=0] The number of milliseconds to delay.
	 * @param {Object} [options={}] The options object.
	 * @param {boolean} [options.leading=false]
	 *  Specify invoking on the leading edge of the timeout.
	 * @param {number} [options.maxWait]
	 *  The maximum time `func` is allowed to be delayed before it's invoked.
	 * @param {boolean} [options.trailing=true]
	 *  Specify invoking on the trailing edge of the timeout.
	 * @returns {Function} Returns the new debounced function.
	 * @example
	 *
	 * // Avoid costly calculations while the window size is in flux.
	 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
	 *
	 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
	 * jQuery(element).on('click', _.debounce(sendMail, 300, {
	 *   'leading': true,
	 *   'trailing': false
	 * }));
	 *
	 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
	 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
	 * var source = new EventSource('/stream');
	 * jQuery(source).on('message', debounced);
	 *
	 * // Cancel the trailing debounced invocation.
	 * jQuery(window).on('popstate', debounced.cancel);
	 */
	function debounce(func, wait, options) {
	  var lastArgs,
	      lastThis,
	      maxWait,
	      result,
	      timerId,
	      lastCallTime,
	      lastInvokeTime = 0,
	      leading = false,
	      maxing = false,
	      trailing = true;

	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  wait = toNumber(wait) || 0;
	  if (isObject(options)) {
	    leading = !!options.leading;
	    maxing = 'maxWait' in options;
	    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
	    trailing = 'trailing' in options ? !!options.trailing : trailing;
	  }

	  function invokeFunc(time) {
	    var args = lastArgs,
	        thisArg = lastThis;

	    lastArgs = lastThis = undefined;
	    lastInvokeTime = time;
	    result = func.apply(thisArg, args);
	    return result;
	  }

	  function leadingEdge(time) {
	    // Reset any `maxWait` timer.
	    lastInvokeTime = time;
	    // Start the timer for the trailing edge.
	    timerId = setTimeout(timerExpired, wait);
	    // Invoke the leading edge.
	    return leading ? invokeFunc(time) : result;
	  }

	  function remainingWait(time) {
	    var timeSinceLastCall = time - lastCallTime,
	        timeSinceLastInvoke = time - lastInvokeTime,
	        result = wait - timeSinceLastCall;

	    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
	  }

	  function shouldInvoke(time) {
	    var timeSinceLastCall = time - lastCallTime,
	        timeSinceLastInvoke = time - lastInvokeTime;

	    // Either this is the first call, activity has stopped and we're at the
	    // trailing edge, the system time has gone backwards and we're treating
	    // it as the trailing edge, or we've hit the `maxWait` limit.
	    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
	      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
	  }

	  function timerExpired() {
	    var time = now();
	    if (shouldInvoke(time)) {
	      return trailingEdge(time);
	    }
	    // Restart the timer.
	    timerId = setTimeout(timerExpired, remainingWait(time));
	  }

	  function trailingEdge(time) {
	    timerId = undefined;

	    // Only invoke if we have `lastArgs` which means `func` has been
	    // debounced at least once.
	    if (trailing && lastArgs) {
	      return invokeFunc(time);
	    }
	    lastArgs = lastThis = undefined;
	    return result;
	  }

	  function cancel() {
	    if (timerId !== undefined) {
	      clearTimeout(timerId);
	    }
	    lastInvokeTime = 0;
	    lastArgs = lastCallTime = lastThis = timerId = undefined;
	  }

	  function flush() {
	    return timerId === undefined ? result : trailingEdge(now());
	  }

	  function debounced() {
	    var time = now(),
	        isInvoking = shouldInvoke(time);

	    lastArgs = arguments;
	    lastThis = this;
	    lastCallTime = time;

	    if (isInvoking) {
	      if (timerId === undefined) {
	        return leadingEdge(lastCallTime);
	      }
	      if (maxing) {
	        // Handle invocations in a tight loop.
	        timerId = setTimeout(timerExpired, wait);
	        return invokeFunc(lastCallTime);
	      }
	    }
	    if (timerId === undefined) {
	      timerId = setTimeout(timerExpired, wait);
	    }
	    return result;
	  }
	  debounced.cancel = cancel;
	  debounced.flush = flush;
	  return debounced;
	}

	/**
	 * Creates a throttled function that only invokes `func` at most once per
	 * every `wait` milliseconds. The throttled function comes with a `cancel`
	 * method to cancel delayed `func` invocations and a `flush` method to
	 * immediately invoke them. Provide `options` to indicate whether `func`
	 * should be invoked on the leading and/or trailing edge of the `wait`
	 * timeout. The `func` is invoked with the last arguments provided to the
	 * throttled function. Subsequent calls to the throttled function return the
	 * result of the last `func` invocation.
	 *
	 * **Note:** If `leading` and `trailing` options are `true`, `func` is
	 * invoked on the trailing edge of the timeout only if the throttled function
	 * is invoked more than once during the `wait` timeout.
	 *
	 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
	 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
	 *
	 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
	 * for details over the differences between `_.throttle` and `_.debounce`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to throttle.
	 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
	 * @param {Object} [options={}] The options object.
	 * @param {boolean} [options.leading=true]
	 *  Specify invoking on the leading edge of the timeout.
	 * @param {boolean} [options.trailing=true]
	 *  Specify invoking on the trailing edge of the timeout.
	 * @returns {Function} Returns the new throttled function.
	 * @example
	 *
	 * // Avoid excessively updating the position while scrolling.
	 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
	 *
	 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
	 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
	 * jQuery(element).on('click', throttled);
	 *
	 * // Cancel the trailing throttled invocation.
	 * jQuery(window).on('popstate', throttled.cancel);
	 */
	function throttle(func, wait, options) {
	  var leading = true,
	      trailing = true;

	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  if (isObject(options)) {
	    leading = 'leading' in options ? !!options.leading : leading;
	    trailing = 'trailing' in options ? !!options.trailing : trailing;
	  }
	  return debounce(func, wait, {
	    'leading': leading,
	    'maxWait': wait,
	    'trailing': trailing
	  });
	}

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && objectToString.call(value) == symbolTag);
	}

	/**
	 * Converts `value` to a number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {number} Returns the number.
	 * @example
	 *
	 * _.toNumber(3.2);
	 * // => 3.2
	 *
	 * _.toNumber(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toNumber(Infinity);
	 * // => Infinity
	 *
	 * _.toNumber('3.2');
	 * // => 3.2
	 */
	function toNumber(value) {
	  if (typeof value == 'number') {
	    return value;
	  }
	  if (isSymbol(value)) {
	    return NAN;
	  }
	  if (isObject(value)) {
	    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
	    value = isObject(other) ? (other + '') : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = value.replace(reTrim, '');
	  var isBinary = reIsBinary.test(value);
	  return (isBinary || reIsOctal.test(value))
	    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
	    : (reIsBadHex.test(value) ? NAN : +value);
	}

	var lodash_throttle = throttle;

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
	    constructor(gl, { format = gl.RGB, internalFormat = format, type = gl.UNSIGNED_BYTE, unpackAlignment = 1, wrapS = gl.CLAMP_TO_EDGE, wrapT = gl.CLAMP_TO_EDGE, minFilter = gl.LINEAR, magFilter = gl.LINEAR, } = {}) {
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
	     * @returns {WebGLTexture|null}
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
	    setIsFlip(flip = 1) {
	        this.setPixelStore(__classPrivateFieldGet(this, _gl$4).UNPACK_FLIP_Y_WEBGL, flip);
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
	            return this;
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

	var _gl$5, _buffer, _depthBuffer, _width$1, _height$1, _depth, _useDepthRenderBuffer;
	class Framebuffer {
	    constructor(gl, params = {}) {
	        _gl$5.set(this, void 0);
	        _buffer.set(this, void 0);
	        _depthBuffer.set(this, void 0);
	        _width$1.set(this, void 0);
	        _height$1.set(this, void 0);
	        _depth.set(this, void 0);
	        _useDepthRenderBuffer.set(this, void 0);
	        const { inputTexture, width = gl.canvas.width, height = gl.canvas.height, wrapS = gl.CLAMP_TO_EDGE, wrapT = gl.CLAMP_TO_EDGE, minFilter = gl.NEAREST, magFilter = gl.NEAREST, format = gl.RGBA, internalFormat = format, type = gl.UNSIGNED_BYTE, depth = true, useDepthRenderBuffer = true, } = params;
	        __classPrivateFieldSet(this, _gl$5, gl);
	        __classPrivateFieldSet(this, _width$1, width);
	        __classPrivateFieldSet(this, _height$1, height);
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
	        this.updateWithSize(__classPrivateFieldGet(this, _width$1), __classPrivateFieldGet(this, _height$1));
	    }
	    bind() {
	        __classPrivateFieldGet(this, _gl$5).bindFramebuffer(__classPrivateFieldGet(this, _gl$5).FRAMEBUFFER, __classPrivateFieldGet(this, _buffer));
	        return this;
	    }
	    unbind() {
	        __classPrivateFieldGet(this, _gl$5).bindFramebuffer(__classPrivateFieldGet(this, _gl$5).FRAMEBUFFER, null);
	        return this;
	    }
	    updateWithSize(width, height, updateTexture = false) {
	        this.bind();
	        const level = 0;
	        const texture = this.texture.getTexture();
	        __classPrivateFieldGet(this, _gl$5).framebufferTexture2D(__classPrivateFieldGet(this, _gl$5).FRAMEBUFFER, __classPrivateFieldGet(this, _gl$5).COLOR_ATTACHMENT0, __classPrivateFieldGet(this, _gl$5).TEXTURE_2D, texture, level);
	        if (__classPrivateFieldGet(this, _depth)) {
	            if (__classPrivateFieldGet(this, _useDepthRenderBuffer)) {
	                __classPrivateFieldSet(this, _depthBuffer, __classPrivateFieldGet(this, _gl$5).createRenderbuffer());
	                __classPrivateFieldGet(this, _gl$5).bindRenderbuffer(__classPrivateFieldGet(this, _gl$5).RENDERBUFFER, __classPrivateFieldGet(this, _depthBuffer));
	                __classPrivateFieldGet(this, _gl$5).renderbufferStorage(__classPrivateFieldGet(this, _gl$5).RENDERBUFFER, __classPrivateFieldGet(this, _gl$5).DEPTH_COMPONENT16, width, height);
	                __classPrivateFieldGet(this, _gl$5).framebufferRenderbuffer(__classPrivateFieldGet(this, _gl$5).FRAMEBUFFER, __classPrivateFieldGet(this, _gl$5).DEPTH_ATTACHMENT, __classPrivateFieldGet(this, _gl$5).RENDERBUFFER, __classPrivateFieldGet(this, _depthBuffer));
	                __classPrivateFieldGet(this, _gl$5).bindRenderbuffer(__classPrivateFieldGet(this, _gl$5).RENDERBUFFER, null);
	            }
	            else {
	                const depthTextureExt = getExtension(__classPrivateFieldGet(this, _gl$5), 'WEBGL_depth_texture');
	                if (!depthTextureExt) {
	                    console.error('Missing extension WEBGL_depth_texture');
	                }
	                this.depthTexture = new Texture(__classPrivateFieldGet(this, _gl$5), {
	                    format: __classPrivateFieldGet(this, _gl$5).DEPTH_COMPONENT,
	                    type: __classPrivateFieldGet(this, _gl$5).UNSIGNED_SHORT,
	                    minFilter: __classPrivateFieldGet(this, _gl$5).LINEAR,
	                    magFilter: __classPrivateFieldGet(this, _gl$5).LINEAR,
	                })
	                    .bind()
	                    .fromSize(__classPrivateFieldGet(this, _width$1), __classPrivateFieldGet(this, _height$1));
	                __classPrivateFieldGet(this, _gl$5).framebufferTexture2D(__classPrivateFieldGet(this, _gl$5).FRAMEBUFFER, __classPrivateFieldGet(this, _gl$5).DEPTH_ATTACHMENT, __classPrivateFieldGet(this, _gl$5).TEXTURE_2D, this.depthTexture.getTexture(), 0);
	            }
	        }
	        this.unbind();
	        if (updateTexture) {
	            this.texture.bind().fromSize(width, height);
	        }
	        __classPrivateFieldSet(this, _width$1, width);
	        __classPrivateFieldSet(this, _height$1, height);
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
	        if (this.depthTexture) {
	            this.depthTexture.delete();
	        }
	        __classPrivateFieldGet(this, _gl$5).deleteFramebuffer(__classPrivateFieldGet(this, _buffer));
	    }
	}
	_gl$5 = new WeakMap(), _buffer = new WeakMap(), _depthBuffer = new WeakMap(), _width$1 = new WeakMap(), _height$1 = new WeakMap(), _depth = new WeakMap(), _useDepthRenderBuffer = new WeakMap();

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

	var _gl$6, _framebuffers, _programs, _textures, _camera, _activeProgram, _textureType;
	class SwapRenderer {
	    constructor(gl) {
	        _gl$6.set(this, void 0);
	        _framebuffers.set(this, new Map());
	        _programs.set(this, new Map());
	        _textures.set(this, new Map());
	        _camera.set(this, void 0);
	        _activeProgram.set(this, void 0);
	        _textureType.set(this, void 0);
	        __classPrivateFieldSet(this, _gl$6, gl);
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
	    createTexture(name, width, height, data, filtering = __classPrivateFieldGet(this, _gl$6).NEAREST, inputType) {
	        const texture = new Texture(__classPrivateFieldGet(this, _gl$6), {
	            type: inputType || __classPrivateFieldGet(this, _textureType),
	            format: __classPrivateFieldGet(this, _gl$6).RGBA,
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
	        const framebuffer = new Framebuffer(__classPrivateFieldGet(this, _gl$6), {
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
	        const geometry = new Geometry(__classPrivateFieldGet(this, _gl$6));
	        geometry
	            .addIndex({ typedArray: indices })
	            .addAttribute('position', { typedArray: vertices, size: 3 })
	            .addAttribute('uv', { typedArray: uv, size: 2 });
	        const mesh = new Mesh(__classPrivateFieldGet(this, _gl$6), {
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
	        __classPrivateFieldGet(this, _gl$6).viewport(0, 0, width, height);
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
	            __classPrivateFieldGet(this, _gl$6).bindFramebuffer(__classPrivateFieldGet(this, _gl$6).FRAMEBUFFER, null);
	        }
	        for (let i = 0; i < inputNameArr.length; i++) {
	            const inputName = inputNameArr[i];
	            const inputTexture = __classPrivateFieldGet(this, _textures).get(inputName);
	            __classPrivateFieldGet(this, _gl$6).activeTexture(__classPrivateFieldGet(this, _gl$6).TEXTURE0 + i);
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
	_gl$6 = new WeakMap(), _framebuffers = new WeakMap(), _programs = new WeakMap(), _textures = new WeakMap(), _camera = new WeakMap(), _activeProgram = new WeakMap(), _textureType = new WeakMap();

	const VERTEX_SHADER_BASE = `
  attribute vec4 position;
  attribute vec2 uv;

  varying vec2 v_uv;

  void main () {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;

    v_uv = uv;
  }
`;

	const FRAGMENT_SHADER_BLUR = `
    uniform sampler2D texture;
    uniform vec2 uMouse;
    uniform vec2 uWindow;

    varying vec2 v_uv;

    float kernel[9];
    vec2 offset[9];

    void main(){
      vec4 sum = vec4(0.0);

      float distance = distance( uMouse, vec2(gl_FragCoord.xy) );

      if (distance < 200.0){
        sum = texture2D(texture, v_uv) * (1.00 + 0.03 * (1.0 - distance/200.0));// + vec4(1.0, 0.0, 0.0, 0.0);
      } else {
        float dx = 1.0/uWindow.x;
        float dy = 1.0/uWindow.y;

        offset[0] = vec2(-dx, -dy);
        offset[1] = vec2(0.0, -dy);
        offset[2] = vec2(dx, -dy);

        offset[3] = vec2(-dx, 0.0);
        offset[4] = vec2(0.0, 0.0);
        offset[5] = vec2(dx, 0.0);

        offset[6] = vec2(-dx, dy);
        offset[7] = vec2(0.0, dy);
        offset[8] = vec2(dx, dy);

        kernel[0] = 1.0/16.0;   kernel[1] = 2.0/16.0;   kernel[2] = 1.0/16.0;
        kernel[3] = 2.0/16.0;   kernel[4] = 4.0/16.0;   kernel[5] = 2.0/16.0;
        kernel[6] = 1.0/16.0;   kernel[7] = 2.0/16.0;   kernel[8] = 1.0/16.0;

        for(int i = 0; i < 9; i++){
          vec4 tmp = texture2D(texture, v_uv + offset[i]);
          sum += tmp * kernel[i];
        }
      }
      gl_FragColor = sum;
      gl_FragColor.a = 0.999;
  }
`;

	const FRAGMENT_SHADER_DISPLAY = `
  uniform sampler2D tDiffuse;

  varying vec2 v_uv;

  void main () {
    gl_FragColor = texture2D(tDiffuse, v_uv);
  }
`;

	const BLUR1 = 'blur1';
	const BLUR2 = 'blur2';
	const VIS_PROGRAM = 'visualise';

	const BLUR_PROGRAM = 'blur';

	const stats = new stats_min();
	document.body.appendChild(stats.domElement);

	const dpr = Math.min(devicePixelRatio, 2);
	const canvas = document.createElement('canvas');
	const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
	document.getElementById('error-log');

	getExtension(gl, 'GMAN_debug_helper');

	const swapRenderer = new SwapRenderer(gl);

	swapRenderer
	  .createProgram(BLUR_PROGRAM, VERTEX_SHADER_BASE, FRAGMENT_SHADER_BLUR)
	  .useProgram(BLUR_PROGRAM)
	  .setSize(innerWidth, innerHeight)
	  .setUniform('texture', UNIFORM_TYPE_INT, 0)
	  .setUniform('uMouse', UNIFORM_TYPE_VEC2, [-3000, -3000])
	  .setUniform('uWindow', UNIFORM_TYPE_VEC2, [innerWidth, innerHeight])

	  .createProgram(VIS_PROGRAM, VERTEX_SHADER_BASE, FRAGMENT_SHADER_DISPLAY)
	  .useProgram(VIS_PROGRAM)
	  .setUniform('tDiffuse', UNIFORM_TYPE_INT, 0);

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.DEPTH_TEST);

	// checkExtensionsSupport()
	document.body.appendChild(canvas);
	requestAnimationFrame(updateFrame);
	resize();
	window.addEventListener('resize', lodash_throttle(resize, 100));
	document.addEventListener('mousemove', (e) => {
	  swapRenderer
	    .useProgram(BLUR_PROGRAM)
	    .setUniform('uMouse', UNIFORM_TYPE_VEC2, [e.pageX, innerHeight - e.pageY]);
	});
	document.addEventListener('touchmove', (e) => {
	  swapRenderer
	    .useProgram(BLUR_PROGRAM)
	    .setUniform('uMouse', UNIFORM_TYPE_VEC2, [
	      e.touches[0].pageX,
	      innerHeight - e.touches[0].pageY,
	    ]);
	});

	function updateFrame() {
	  stats.begin();

	  swapRenderer
	    .setSize(innerWidth, innerHeight)
	    .useProgram(BLUR_PROGRAM)
	    .run([BLUR1], BLUR2)
	    .setSize(innerWidth * dpr, innerHeight * dpr)
	    .run([BLUR1], null)
	    .swap(BLUR1, BLUR2);

	  stats.end();

	  requestAnimationFrame(updateFrame);
	}

	function resize() {
	  canvas.width = innerWidth * dpr;
	  canvas.height = innerHeight * dpr;
	  canvas.style.setProperty('width', `${innerWidth}px`);
	  canvas.style.setProperty('height', `${innerHeight}px`);

	  let initData;
	  let texType;

	  const ext = getExtension(gl, 'WEBGL_color_buffer_float');
	  getExtension(gl, 'OES_texture_float');
	  if (ext) {
	    initData = new Float32Array(innerWidth * innerHeight * 4);
	    texType = gl.FLOAT;
	  } else {
	    const ext = getExtension(gl, 'EXT_color_buffer_half_float');
	    const ext2 = getExtension(gl, 'OES_texture_half_float');
	    if (ext) {
	      initData = new Float32Array(innerWidth * innerHeight * 4);
	      texType = ext2.HALF_FLOAT_OES;
	    } else {
	      initData = new Uint8Array(innerWidth * innerHeight * 4);
	      texType = gl.UNSIGNED_BYTE;
	    }
	  }

	  for (var i = 0; i < initData.length; i++) {
	    initData[i] = (Math.random() - 0.5) * 255;
	  }

	  swapRenderer
	    .createTexture(
	      BLUR1,
	      innerWidth,
	      innerHeight,
	      initData,
	      gl.NEAREST,
	      texType,
	    )
	    .createFramebuffer(BLUR1, innerWidth, innerHeight)

	    .createTexture(BLUR2, innerWidth, innerHeight, null, gl.NEAREST, texType)
	    .createFramebuffer(BLUR2, innerWidth, innerHeight)

	    .useProgram(BLUR_PROGRAM)
	    .setUniform('uWindow', UNIFORM_TYPE_VEC2, [innerWidth, innerHeight]);
	}

}());