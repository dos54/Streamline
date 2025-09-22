import { z } from 'zod'
import { NodeResourceZ } from '@/schemas/nodeResource.schema'

export type NodeResource = z.infer<typeof NodeResourceZ>
