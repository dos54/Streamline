import { z } from 'zod'

export const NodeResourceZ = z.object({
  id: z.string().min(1), // stable handle id
  label: z.string().optional(),
  perCycle: z.number(),
  consumptionChance: z.number().min(0).max(1).default(1),
  unitId: z.string().min(1).optional(), // falls back to Resource.defaultUnitId
})
