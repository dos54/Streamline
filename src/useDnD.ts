// use Drag and Drop helper functions

import type { NodeType } from "./components/sidebar/NodeSidebar.vue";

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

        const draggedNode: NodeType = JSON.parse(nodeString)

        const position = screenToFlowCoordinate({
            x: event.clientX,
            y: event.clientY,
        })
        const newNode = {
            id: getId(),
            type: draggedNode.type,
            position,
            data: draggedNode.defaultData
        }

        return newNode
    }

    return {
        onDragOver, onDrop
    }
}


