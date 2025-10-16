import { z } from 'zod'

// helpers
const DraftStr = z.string().optional().default('')
const DraftNum = z.number().nonnegative().optional().default(0)

export const GraphNodeZ = z
  .object({
    id: z.string().min(1),
    type: z.enum(['producer']),
    name: z.string().optional().default('Node'),
    enabled: z.boolean().optional().default(true),
    position: z.object({ x: z.number(), y: z.number() }),
    count: z.number().int().min(1).optional().default(1),
    cycleTime: z.number().nonnegative().optional().default(1),
    mode: z.enum(['producer', 'consumer', 'transformer']),

    inputs: z
      .array(
        z
          .object({
            resourceId: DraftStr,
            unitId: DraftStr,
            perCycle: DraftNum,
          })
          .loose(),
      )
      .optional()
      .default([]),

    outputs: z
      .array(
        z
          .object({
            id: z
              .string()
              .optional()
              .default(() => crypto.randomUUID()),
            resourceId: DraftStr,
            unitId: DraftStr,
            perCycle: DraftNum,
          })
          .loose(),
      )
      .optional()
      .default([]),

    ui: z
      .object({
        width: z.number().positive().optional(),
        height: z.number().positive().optional(),
        zIndex: z.number().optional(),
        // you can stash draft UI state like direction here if needed
        direction: z.enum(['ltr', 'rtl']).optional(),
      })
      .optional(),

    templateId: z.string().optional(),

    data: z
      .object({
        resources: z
          .array(
            z
              .object({
                id: z.string().min(1),
                name: z.string().min(1),
                // make defaultUnitId optional for draft friendliness
                defaultUnitId: z.string().optional().default(''),
              })
              .loose(),
          )
          .optional()
          .default([]),
      })
      .optional()
      .default({ resources: [] }),
  })
  .loose()
