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
	    return shader;
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
	    return program;
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
	    setUniform(uniformName, uniformType, 
	    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	    uniformValue) {
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

	var _position, _positionVec3, _scale, _scaleVec3, _rotationAxis, _rotationAxisVec3, _rotationAngle, _gl$2, _geometry;
	/**
	 * Mesh class for holding the geometry, program and shaders for an object.
	 *
	 * @public
	 */
	class Mesh {
	    constructor(gl, params) {
	        _position.set(this, [0, 0, 0]);
	        _positionVec3.set(this, create$1());
	        _scale.set(this, [1, 1, 1]);
	        _scaleVec3.set(this, create$1());
	        _rotationAxis.set(this, [0, 0, 0]);
	        _rotationAxisVec3.set(this, create$1());
	        _rotationAngle.set(this, 0);
	        _gl$2.set(this, void 0);
	        _geometry.set(this, void 0);
	        this.modelMatrixNeedsUpdate = false;
	        this.modelMatrix = create();
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
	            // @ts-ignore
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
	        this.program.setUniform(MODEL_MATRIX_UNIFORM_NAME, UNIFORM_TYPE_MATRIX4X4, this.modelMatrix);
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
	        if (this.modelMatrixNeedsUpdate) {
	            this.updateModelMatrix();
	            this.modelMatrixNeedsUpdate = false;
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
	_position = new WeakMap(), _positionVec3 = new WeakMap(), _scale = new WeakMap(), _scaleVec3 = new WeakMap(), _rotationAxis = new WeakMap(), _rotationAxisVec3 = new WeakMap(), _rotationAngle = new WeakMap(), _gl$2 = new WeakMap(), _geometry = new WeakMap();

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

	const PARTICLE_COUNT = 500;

	const stats = new stats_min();
	document.body.appendChild(stats.domElement);

	const dpr = Math.min(devicePixelRatio, 2);
	const canvas = document.createElement('canvas');
	const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

	let oldTime = 0;
	let spacing = 1;
	let spacingTarget = spacing;

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	const camera = new PerspectiveCamera(
	  (45 * Math.PI) / 180,
	  innerWidth / innerHeight,
	  0.1,
	  100,
	);
	camera.position = [0, 0, 40];
	camera.lookAt([0, 0, 0]);

	const vertexArray = new Float32Array(PARTICLE_COUNT).fill(0);

	for (let i = 0; i < PARTICLE_COUNT; i++) {
	  vertexArray[i] = i;
	}

	const geometry = new Geometry(gl);
	geometry.addAttribute('position', {
	  typedArray: vertexArray,
	  size: 1,
	});

	const mesh = new Mesh(gl, {
	  geometry,
	  vertexShaderSource: `
    uniform float time;
    uniform float spacing;

    attribute vec4 position;

    const vec4 cameraPosition = vec4(0.0, 0.0, 40.0, 1.0);
    const float movementMaxRadius = 10.0;

    void main () {
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(
        sin(time + position.x) * movementMaxRadius,
        cos(time + position.x) * movementMaxRadius,
        cos(time + position.x * spacing * 20.0) * movementMaxRadius,
        position.w
      );

      float dist = distance(cameraPosition, gl_Position);
      gl_PointSize = dist * 0.225;
    }
  `,
	  fragmentShaderSource: `
    void main () {
      float dist = distance(gl_PointCoord, vec2(0.5));
      float c = clamp(0.5 - dist, 0.0, 1.0);
      gl_FragColor = vec4(vec3(1.0), c);
    }
  `,
	});

	mesh.use();
	mesh.drawMode = gl.POINTS;

	document.body.appendChild(canvas);
	setInterval(() => {
	  spacingTarget = Math.random() * 0.85 + 0.15;
	}, 5000);
	requestAnimationFrame(updateFrame);
	sizeCanvas();
	window.addEventListener('resize', lodash_throttle(resize, 100));

	function updateFrame(ts) {
	  ts /= 1000;
	  const dt = ts - oldTime;
	  oldTime = ts;

	  stats.begin();

	  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	  gl.clearColor(0.9, 0.9, 0.9, 1);
	  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	  spacing += (spacingTarget - spacing) * (dt * 20);

	  mesh
	    .setCamera(camera)
	    .setUniform('time', UNIFORM_TYPE_FLOAT, ts)
	    .setUniform('spacing', UNIFORM_TYPE_FLOAT, spacing)
	    .draw();

	  stats.end();

	  requestAnimationFrame(updateFrame);
	}

	function resize() {
	  camera.aspect = innerWidth / innerHeight;
	  camera.updateProjectionMatrix();

	  sizeCanvas();
	}

	function sizeCanvas() {
	  canvas.width = innerWidth * dpr;
	  canvas.height = innerHeight * dpr;
	  canvas.style.setProperty('width', `${innerWidth}px`);
	  canvas.style.setProperty('height', `${innerHeight}px`);
	}

}());