import { z } from 'zod'



export const UnitZ = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  symbol: z.string(),
  baseUnit: z.string().min(1),
  factor: z.number().positive(),
  dimension: z.string().min(1), // e.g., "mass" | "time"
  aliases: z.array(z.string()).optional(),
})
