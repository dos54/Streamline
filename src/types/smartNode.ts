import type { NodeResource } from './nodeResource'

export type SmartNodeData = {
  label?: string
  direction?: 'ltr' | 'rtl'
  cycleTime?: number
  inputs?: NodeResource[]
  outputs?: NodeResource[]
  resources?: {
    id: string
    name: string
    defaultUnitId: string
  }[]
  statusMessages?: string[]
  statusColor?: string
}
