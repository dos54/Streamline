

export type Resource = {
  id: string
  name: string
  defaultUnitId?: string
}

export type IO = {
  resourceId: string
  unitId: string
  perCycle: number
}

export type SmartNodeData = {
  label: string
  direction: 'ltr' | 'rtl'
  cycleTime: number
  inputs: IO[]
  outputs: IO[]
  resources?: Resource[]
}

export type Node = {
  id: string
  type: string
  position: { x: number; y: number }
  data: SmartNodeData
}
