import { z } from 'zod'
import { NodeResourceZ } from './nodeResource.schema'

export const GraphNodeZ = z.object({
  id: z.string().min(1),
  type: z.enum(['smart']), // restrict to SmartNode only
  name: z.string().min(1),
  enabled: z.boolean().default(true),
  position: z.object({ x: z.number(), y: z.number() }),
  count: z.number().int().min(1).default(1),
  cycleTime: z.number().positive(),
  mode: z.enum(['producer', 'consumer', 'transformer']),
  inputs: z.array(
    z.object({
      resourceId: z.string().min(1),
      unitId: z.string().min(1),
      perCycle: z.number().positive()
    })
  ),
  outputs: z.array(
    z.object({
      id: z.string().min(1),
      resourceId: z.string().min(1),
      unitId: z.string().min(1),
      perCycle: z.number().positive()
    })
  ),
  tags: z.array(z.string()).optional(),
  ui: z
    .object({
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
      zIndex: z.number().optional(),
    })
    .optional(),
  templateId: z.string().optional(),


  data: z.object({
  resources: z
    .array(z.object({
      id: z.string(),
      name: z.string(),
      defaultUnitId: z.string()
    }))
    .optional(),
  statusMessages: z.array(z.string()).optional(),
  statusColor: z.string().optional()
}).optional()

})
