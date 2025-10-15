// use Drag and Drop helper functions

import type { GraphNode } from './types/graphNode'
import type { Node as VFNode } from '@vue-flow/core'
import { useProjectStore } from './stores/project.store'

type IODef = { resourceId: string; unitId: string; perCycle: number; label?: string }
type ResourceRef = { id: string; name: string; defaultUnitId: string }
type BaseData = { label: string; direction: 'ltr' | 'rtl'; resources: ResourceRef[] }
type ConsumerData = BaseData & { inputs: IODef[] }
type ProducerData = BaseData & { cycleTime: number; inputs: IODef[]; outputs: IODef[] }
type FlowNode = VFNode<ProducerData | ConsumerData>

// from DnD tutorial
// TODO: adjust the id naming convention
function getId() {
  return `${crypto.randomUUID()}`
}

function mapFlowNodeToGraphNode(n: FlowNode): GraphNode {
  const data = n.data as ProducerData | ConsumerData
  const isProducer = (d: ProducerData | ConsumerData): d is ProducerData =>
    (d as ProducerData).cycleTime !== undefined && Array.isArray((d as ProducerData).outputs)

  return {
    id: n.id,
    type: 'producer',
    mode: isProducer(data) ? 'producer' : 'consumer',
    name: data.label ?? n.id,
    enabled: true,
    position: n.position ?? { x: 0, y: 0 },
    count: 1,
    cycleTime: isProducer(data) ? data.cycleTime : 1,
    inputs: (data.inputs ?? []).map((i) => ({
      resourceId: i.resourceId,
      unitId: i.unitId,
      perCycle: i.perCycle,
    })),
    outputs: isProducer(data)
      ? data.outputs.map((o, idx) => ({
          id: `out:${o.resourceId}:${idx}`,
          resourceId: o.resourceId,
          unitId: o.unitId,
          perCycle: o.perCycle,
        }))
      : [],
    templateId: '',
    data: {
      resources: (data.resources ?? []).filter(
        (r): r is ResourceRef => typeof r.defaultUnitId === 'string'
      ),
    },
  }
}

export default function useDragAndDrop() {
  const project = useProjectStore()

  function onDragOver(event: DragEvent) {
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
  }

  function onDrop(
    event: DragEvent,
    screenToFlowCoordinate: (arg0: { x: number; y: number }) => { x: number; y: number },
  ) {
    const nodeString = event.dataTransfer?.getData('application/vueflow') // stringified node
    if (!nodeString) {
      return null // non-valid drop.
    }

    const draggedNode = JSON.parse(nodeString) as FlowNode

    const position: { x: number; y: number } = screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY,
    })

    const newNode: FlowNode =
      draggedNode.type === 'consumer'
        ? {
            id: `consumer-${getId()}`,
            type: 'consumer',
            position,
            data: {
              label: 'Smelter',
              direction: 'ltr',
              inputs: [{ resourceId: 'power', unitId: 'kWh', perCycle: 1 }],
              resources: [{ id: 'power', name: 'Electricity', defaultUnitId: 'kWh' }],
            },
          }
        : {
            id: `producer-${getId()}`,
            type: 'producer',
            position,
            data: {
              label: 'Iron Mine',
              direction: 'ltr',
              cycleTime: 5,
              inputs: [
                { resourceId: 'power', unitId: 'kWh', perCycle: 0.5 },
                { resourceId: 'steel', unitId: 'kg', perCycle: 2 },
              ],
              outputs: [
                { resourceId: 'steel', unitId: 'kg', perCycle: 1 },
                { resourceId: 'power', unitId: 'kWh', perCycle: 2 },
              ],
              resources: [
                { id: 'power', name: 'Electricity', defaultUnitId: 'kWh' },
                { id: 'steel', name: 'Steel', defaultUnitId: 'kg' },
              ],
            },
          }

    const gn = mapFlowNodeToGraphNode(newNode)
    project.upsertNode(gn)
    return newNode
  }

  function onNodeDragStop(nodeId: string, position: { x: number; y: number }) {
    project.updateNodePosition(nodeId, position)
  }

  return {
    onDragOver,
    onDrop,
    onNodeDragStop,
  }
}
