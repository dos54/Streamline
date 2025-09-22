import { z } from 'zod'
import { GraphEdgeZ } from '@/schemas/graphEdge.schema'
export type GraphEdge = z.infer<typeof GraphEdgeZ>
