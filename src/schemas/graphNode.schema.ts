import { z } from 'zod'
import { NodeResourceZ } from './nodeResource.schema'




// ✅ Define reusable IO schema
export const NodeIOZ = z.object({
  id: z.string().optional(),
  resourceId: z.string().min(1),
  unitId: z.string().min(1),
  perCycle: z.number().positive().optional() // optional to avoid TS18048
})


export type NodeIO = z.infer<typeof NodeIOZ>
export type GraphNode = z.infer<typeof GraphNodeZ>





// ✅ Define resource schema (if not already defined in nodeResource.schema.ts)
export const ResourceZ = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  defaultUnitId: z.string().min(1).optional(), // ✅ must be optional
  category: z.string().optional(),
  precision: z.number().optional(),
  aliases: z.array(z.string()).optional()
})

export type Resource = z.infer<typeof ResourceZ>


// ✅ Main GraphNode schema
export const GraphNodeZ = z.object({
  id: z.string().min(1),
  type: z.enum(['smart', 'producer', 'consumer']),
  name: z.string().min(1),
  enabled: z.boolean().default(true),
  position: z.object({ x: z.number(), y: z.number() }),
  count: z.number().int().min(1).default(1),
  cycleTime: z.number().positive(),
  mode: z.enum(['producer', 'consumer', 'transformer']),
  inputs: z.array(NodeIOZ),
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

  // ✅ Extended data block for SmartNode UI and validation
  data: z
    .object({
      label: z.string().optional(),
      direction: z.string().optional(),
      cycleTime: z.number().optional(),
      resources: z.array(ResourceZ).optional(),
      inputs: z.array(NodeIOZ).optional(),
      outputs: z.array(NodeIOZ).optional(),
      statusMessages: z.array(z.string()).optional(),
      statusColor: z.string().optional(),
      statusTypes: z.array(z.string()).optional()
    })
    .optional()
})
// ✅ TypeScript type inference from Zod schemas
//export type NodeIO = z.infer<typeof NodeIOZ>
//export type Resource = z.infer<typeof ResourceZ>
//export type GraphNode = z.infer<typeof GraphNodeZ>

