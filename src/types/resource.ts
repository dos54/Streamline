import { z } from 'zod'
import { ResourceZ } from '@/schemas/resource.schema'

export type Resource = z.infer<typeof ResourceZ>
