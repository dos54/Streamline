import { z } from 'zod'

export const ResourceZ = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  defaultUnitId: z.string().min(1).optional(), // unitless allowed
  category: z.string().optional(),
  precision: z.number().int().nonnegative().optional(),
  aliases: z.array(z.string()).optional(),
})
