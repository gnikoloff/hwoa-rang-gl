/**
 * Clamp number to a given range
 * @param {number} num
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const clamp = (num: number, min: number, max: number): number =>
  Math.min(Math.max(num, min), max)

/**
 *
 * @param {number} val
 * @param {number} inMin
 * @param {number} inMax
 * @param {number} outMin
 * @param {number} outMax
 * @returns {number}
 */
export const mapNumberRange = (
  val: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number => {
  return ((val - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

/**
 * Check if number is power of 2
 * @param {number} value
 * @returns {number}
 */
export const isPowerOf2 = (value: number): boolean =>
  (value & (value - 1)) === 0

/**
 * Normalizes a number
 * @param {number} min
 * @param {number} max
 * @param {number} val
 * @returns {number}
 */
export const normalizeNumber = (
  min: number,
  max: number,
  val: number,
): number => (val - min) / (max - min)

/**
 *
 * @param {number} t
 * @returns {number}
 */
export const triangleWave = (t: number): number => {
  t -= Math.floor(t * 0.5) * 2
  t = Math.min(Math.max(t, 0), 2)
  return 1 - Math.abs(t - 1)
}
