// use Drag and Drop helper functions

import type { GraphNode } from "./types/graphNode"
import type { NodeTypesObject, Node, Edge } from '@vue-flow/core'
let id = 2

// from DnD tutorial
// TODO: adjust the id naming convention
function getId() {
    return `${id++}`
}

export default function useDragAndDrop() {

    function onDragOver(event: DragEvent) {
        event.preventDefault()
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move'
        }
    }

    function onDrop(event: DragEvent, screenToFlowCoordinate: (arg0: { x: number; y: number; }) => any) {

        const nodeString = event.dataTransfer?.getData('application/vueflow') // stringnified node
        if (!nodeString) {
            return null // non-valid drop.
        }

        const draggedNode: Node = JSON.parse(nodeString)

        const position: { x: number, y: number } = screenToFlowCoordinate({
            x: event.clientX,
            y: event.clientY,
        })

        let newNode: Node = { id: '', position: { x: 0, y: 0 } }
        // create default according to node's type:
        if (draggedNode.type === 'consumer') {
            newNode = {
                id: `consumer-${getId()}`,
                type: 'consumer',
                position: { x: position.x, y: position.y },
                data: {
                    label: 'Smelter',
                    direction: 'ltr',
                    inputs: [
                        { resourceId: 'power', unitId: 'kWh', perCycle: 1 }
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
                position: { x: position.x, y: position.y },
                data: {
                    label: 'Iron Mine',
                    direction: 'ltr',
                    cycleTime: 5,
                    inputs: [
                        { resourceId: 'power', unitId: 'kWh', perCycle: 0.5 },
                        { resourceId: 'steel', unitId: 'kg', perCycle: 2 }
                    ],
                    outputs: [
                        { resourceId: 'steel', unitId: 'kg', perCycle: 1 },
                        { resourceId: 'power', unitId: 'kWh', perCycle: 2 }
                    ]

                    ,
                    resources: [
                        { id: 'power', name: 'Electricity', defaultUnitId: 'kWh' },
                        { id: 'steel', name: 'Steel', defaultUnitId: 'kg' }
                    ]
                }
            }
        }

        return newNode
    }

    return {
        onDragOver, onDrop
    }
}


