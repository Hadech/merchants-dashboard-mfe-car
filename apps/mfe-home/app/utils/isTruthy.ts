export function isTruthy(value: string | undefined | null): boolean {
  const v = String(value ?? '').toLowerCase()
  return v === 'true' || v === '1' || v === 'yes'
}
