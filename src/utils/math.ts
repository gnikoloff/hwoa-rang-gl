/**
 * Clamp number to a given range
 * @param {num}
 * @param {min}
 * @param {max}
 * @returns {number}
 */
export const clamp = (num: number, min: number, max: number): number =>
  Math.min(Math.max(num, min), max)

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
