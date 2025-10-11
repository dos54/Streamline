// use Drag and Drop helper functions

import type { Node } from '@vue-flow/core'
import type { NodeResource } from '@/types/nodeResource'
import type { Resource } from '@/types/resource'

let id = 2

function getId() {
  return `${id++}`
}

function normalizePort(port: any): NodeResource {
  return {
    id: port.id ?? port.resourceId ?? '',
    unitId: port.unitId ?? '',
    perCycle: port.perCycle ?? 1,
    label: port.label ?? '',
    consumptionChance: port.consumptionChance ?? 1
  }
}

export default function useDragAndDrop() {
  function onDragOver(event: DragEvent) {
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
  }

  function onDrop(
    event: DragEvent,
    screenToFlowCoordinate: (arg0: { x: number; y: number }) => any
  ): Node | null {
    const nodeString = event.dataTransfer?.getData('application/vueflow')
    if (!nodeString) return null

    const draggedNode: Node = JSON.parse(nodeString)

    const position = screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY,
    })

    let newNode: Node = { id: '', position: { x: 0, y: 0 } }

    if (draggedNode.type === 'consumer') {
      newNode = {
        id: `consumer-${getId()}`,
        type: 'consumer',
        position,
        data: {
          label: 'Smelter',
          direction: 'ltr',
          inputs: [
            { id: 'power', unitId: 'kWh', perCycle: 1 }
          ],
          resources: [
            { id: 'power', name: 'Electricity', defaultUnitId: 'kWh' }
          ]
        }
      }
    } else if (draggedNode.type === 'producer') {
      newNode = {
        id: `producer-${getId()}`,
        type: 'producer',
        position,
        data: {
          label: 'Iron Mine',
          direction: 'ltr',
          cycleTime: 5,
          inputs: [
            { id: 'power', unitId: 'kWh', perCycle: 0.5 },
            { id: 'steel', unitId: 'kg', perCycle: 2 }
          ],
          outputs: [
            { id: 'steel', unitId: 'kg', perCycle: 1 },
            { id: 'power', unitId: 'kWh', perCycle: 2 }
          ],
          resources: [
            { id: 'power', name: 'Electricity', defaultUnitId: 'kWh' },
            { id: 'steel', name: 'Steel', defaultUnitId: 'kg' }
          ]
        }
      }
    } else if (draggedNode.type === 'smart') {
      const rawInputs = draggedNode.data?.inputs ?? []
      const rawOutputs = draggedNode.data?.outputs ?? []

      const inputs: NodeResource[] = rawInputs.map(normalizePort)
      const outputs: NodeResource[] = rawOutputs.map(normalizePort)

      const allResources: Resource[] = [...inputs, ...outputs]
        .filter(r => r.id && r.unitId)
        .map(r => ({
          id: r.id,
          name: r.label || r.id.charAt(0).toUpperCase() + r.id.slice(1),
          defaultUnitId: r.unitId
        }))

      newNode = {
        id: `smart-${getId()}`,
        type: 'smart',
        position,
        data: {
          label: draggedNode.data?.label ?? 'SmartNode',
          direction: draggedNode.data?.direction ?? 'ltr',
          cycleTime: draggedNode.data?.cycleTime ?? 1,
          inputs,
          outputs,
          resources: allResources
        }
      }
    }

    return newNode
  }

  return {
    onDragOver,
    onDrop
  }
}
