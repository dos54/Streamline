// use Drag and Drop helper functions

import type { GraphNode } from "./types/graphNode"

let id = 0

// from DnD tutorial
// TODO: adjust the id naming convention
function getId() {
    return `dnd_node_${id++}`
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

        const draggedNode: GraphNode = JSON.parse(nodeString)

        const position: { x: number, y: number } = screenToFlowCoordinate({
            x: event.clientX,
            y: event.clientY,
        })
        const newNode = {
            id: getId(), // TODO: change to nanoId 
            type: draggedNode.type,
            name: `${draggedNode.type}-${id}`,
            position,
            templateId: '',
            data: {
                ...draggedNode.data,
            },
        }

        return newNode
    }

    return {
        onDragOver, onDrop
    }
}


