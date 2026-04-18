import type { BusinessProcedure } from '@wompi/types'

export function getLastProcedure(procedures: BusinessProcedure[]): BusinessProcedure | undefined {
  if (!procedures || procedures.length === 0) return undefined
  return procedures[procedures.length - 1]
}
