import { z } from 'zod'

const resourceSchema = z.object({
  resourceId: z.string(),
  unitId: z.string(),
  perCycle: z.number().nonnegative(),
})

const resourceMetaSchema = z.object({
  id: z.string(),
  name: z.string(),
  defaultUnitId: z.string().optional(),
})

export const nodeSchema = z.object({
  id: z.string(),
  type: z.enum(['producer', 'consumer', 'transformer']),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.object({
    label: z.string(),
    direction: z.enum(['ltr', 'rtl']),
    cycleTime: z.number().positive().optional(),
    inputs: z.array(resourceSchema).optional(),
    outputs: z.array(resourceSchema).optional(),
    resources: z.array(resourceMetaSchema),
  }),
})

export function validateNodeJson(json: unknown) {
  const result = z.array(nodeSchema).safeParse(json)
  return {
    valid: result.success,
    errors: result.success ? [] : (result.error?.issues ?? []),
  }
}
