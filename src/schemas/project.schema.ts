import { z } from 'zod'
import { UnitZ } from './unit.schema'
import { ResourceZ } from './resource.schema'
import { GraphNodeZ } from './graphNode.schema'
import { GraphEdgeZ } from './graphEdge.schema'

export const BalancingConfigZ = z.object({
  mode: z.enum(['per_cycle', 'per_time']),
  targetTimeUnitId: z.string().min(1),
  tolerance: z.number().positive(),
})

export const ProjectSettingsZ = z.object({
  baseTimeUnitId: z.string().min(1),
  defaultRateDisplay: z.enum(['per_s', 'per_min', 'per_hr']),
  resourceDefaultUnits: z.record(z.string(), z.string()).default({}),
  balancing: BalancingConfigZ,
  ui: z
    .object({
      snapToGrid: z.boolean().optional(),
      gridSize: z.number().int().positive().optional(),
      minimap: z.boolean().optional(),
    })
    .optional(),
})

export const ProjectZ = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  schemaVersion: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
  settings: ProjectSettingsZ,
  units: z.array(UnitZ),
  resources: z.array(ResourceZ),
  nodes: z.array(GraphNodeZ),
  edges: z.array(GraphEdgeZ),
})
