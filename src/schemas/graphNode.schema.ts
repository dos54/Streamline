import { z } from 'zod'
import { NodeResourceZ } from './nodeResource.schema'

export const GraphNodeZ = z.object({
  id: z.string().min(1),
  type: z.enum(['machine', 'source', 'sink']),
  name: z.string().min(1),
  enabled: z.boolean(),
  position: z.object({ x: z.number(), y: z.number() }),
  count: z.number().int().min(1),
  inputs: z.array(NodeResourceZ),
  outputs: z.array(NodeResourceZ),
  cycleTime: z.number().positive(),
  cycleTimeUnitId: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  ui: z
    .object({
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
      zIndex: z.number().optional(),
    })
    .optional(),
  templateId: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
})
