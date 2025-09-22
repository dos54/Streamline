import { z } from 'zod'
import { UnitZ } from '@/schemas/unit.schema'

export type Unit = z.infer<typeof UnitZ>
