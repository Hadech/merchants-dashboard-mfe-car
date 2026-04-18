import type { BusinessProcedure } from '@wompi/types'

/**
 * Returns the last procedure in the array, or undefined if empty.
 */
export function getLastProcedure(procedures: BusinessProcedure[]): BusinessProcedure | undefined {
  if (!procedures || procedures.length === 0) return undefined
  return procedures[procedures.length - 1]
}
