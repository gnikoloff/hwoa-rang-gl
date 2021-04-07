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
