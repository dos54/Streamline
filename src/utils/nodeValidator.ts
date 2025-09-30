import { z } from 'zod'

const resourceSchema = z.object({
  resourceId: z.string(),
  unitId: z.string(),
  perCycle: z.number().nonnegative()
})

export const nodeSchema = z.object({
  label: z.string(),
  mode: z.enum(['producer', 'consumer', 'transformer']),
  direction: z.enum(['ltr', 'rtl']),
  cycleTime: z.number().positive(),
  inputs: z.array(resourceSchema),
  outputs: z.array(resourceSchema),
  resources: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      defaultUnitId: z.string()
    })
  )
})

export function validateNodeJson(json: unknown) {
  const result = nodeSchema.safeParse(json)
  return {
    valid: result.success,
    errors: result.success ? [] : result.error.errors
  }
}
