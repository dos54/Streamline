// use Drag and Drop helper functions

import { useVueFlow } from "@vue-flow/core";

let id = 0

// from DnD tutorial
// TODO: adjust the id naming convention
function getId() {
    return `dnd_node_${id++}`
}

export default function useDragAndDrop() {
    const { addNodes, screenToFlowCoordinate } = useVueFlow()

    function onDragOver(event: DragEvent) {
        event.preventDefault()
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move'
        }
    }

    function onDrop(event: DragEvent) {
        const type = event.dataTransfer?.getData('application/vueflow')
        if (!type) {
            return
        }

        const position = screenToFlowCoordinate({
            x: event.clientX,
            y: event.clientY,
        })

        const newNode = {
            id: getId(),
            type,
            position,
            label: `${type} node`
        }

        addNodes([newNode])
    }

    return {
        onDragOver, onDrop
    }
}


