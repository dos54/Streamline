import type { FlowNode } from '@vue-flow/core'

type DroppedNode = {
  id: string
  type: string
  position: { x: number; y: number }
  data: {
    label?: string
    direction?: string
    cycleTime?: number
    inputs?: any[]
    outputs?: any[]
    data?: {
      resources?: { id: string; name: string; defaultUnitId?: string }[]
    }
  }
}

export function convertNodeToGraphNode(droppedNode: DroppedNode): FlowNode {
  return {
    id: droppedNode.id,
    type: droppedNode.type,
    position: droppedNode.position,
    data: {
      label: droppedNode.data.label,
      direction: droppedNode.data.direction,
      cycleTime: droppedNode.data.cycleTime,
      inputs: droppedNode.data.inputs,
      outputs: droppedNode.data.outputs,
      data: {
        ...(droppedNode.data.data ?? {})
      }
    }
  }
}

