/**
 * Clamp number to a given range
 * @param {number} num
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export declare const clamp: (num: number, min: number, max: number) => number;
/**
 *
 * @param {number} val
 * @param {number} inMin
 * @param {number} inMax
 * @param {number} outMin
 * @param {number} outMax
 * @returns {number}
 */
export declare const mapNumberRange: (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => number;
/**
 * Check if number is power of 2
 * @param {number} value
 * @returns {number}
 */
export declare const isPowerOf2: (value: number) => boolean;
/**
 * Normalizes a number
 * @param {number} min
 * @param {number} max
 * @param {number} val
 * @returns {number}
 */
export declare const normalizeNumber: (min: number, max: number, val: number) => number;
/**
 *
 * @param {number} t
 * @returns {number}
 */
export declare const triangleWave: (t: number) => number;
