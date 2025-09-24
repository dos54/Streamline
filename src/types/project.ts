import { z } from 'zod'
import { ProjectZ, ProjectSettingsZ, BalancingConfigZ } from '@/schemas/project.schema'

export type BalancingConfig = z.infer<typeof BalancingConfigZ>
export type ProjectSettings = z.infer<typeof ProjectSettingsZ>
export type Project = z.infer<typeof ProjectZ>

export type Unit = {
  id: string
  name: string
  symbol: string
  baseUnit: string
  factor: number
  dimension: string
  aliases?: string[]
}
