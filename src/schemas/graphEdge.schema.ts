import { z } from 'zod'

export const GraphEdgeZ = z.object({
  id: z.string().min(1),
  enabled: z.boolean(),
  type: z.string().optional(), // VueFlow edge type
  label: z.string().optional(),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.string().min(1),
  targetHandle: z.string().min(1),
  waypoints: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
})
