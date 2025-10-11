import type { GraphNode } from '@/schemas/graphNode.schema'
import { useProjectStore } from '@/stores/project.store'

//const projectStore = useProjectStore()

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

export function convertNodeToGraphNode(droppedNode: DroppedNode): GraphNode {
  return {
    id: droppedNode.id,
    type: droppedNode.type as 'smart' | 'producer' | 'consumer',
    name: droppedNode.data.label ?? 'Unnamed',
    enabled: true,
    position: droppedNode.position,
    count: 1,
    cycleTime: droppedNode.data.cycleTime ?? 1,
    mode: 'producer',
    inputs: droppedNode.data.inputs ?? [],
    outputs: droppedNode.data.outputs ?? [],
    tags: [],
    ui: undefined,
    templateId: undefined,
    data: {
      label: droppedNode.data.label,
      direction: droppedNode.data.direction,
      cycleTime: droppedNode.data.cycleTime,
      inputs: droppedNode.data.inputs,
      outputs: droppedNode.data.outputs,
      resources: droppedNode.data.data?.resources ?? []
    }
  }
}
