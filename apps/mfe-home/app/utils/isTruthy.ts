/**
 * Evaluates if a string value is truthy.
 * Returns true only if the lowercase string is exactly "true", "1", or "yes".
 */
export function isTruthy(value: string): boolean {
  const normalized = value.toLowerCase()
  return normalized === 'true' || normalized === '1' || normalized === 'yes'
}
