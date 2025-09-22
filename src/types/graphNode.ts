import { z } from 'zod'
import { GraphNodeZ } from '@/schemas/graphNode.schema'

export type GraphNode = z.infer<typeof GraphNodeZ>
