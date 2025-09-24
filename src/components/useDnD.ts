import { useVueFlow } from "@vue-flow/core";
import { ref, watch } from 'vue';

let id = 0

/**
 * @returns {string} - A unique id.
 */
function getId(): string {
    return `dndnode_${id++}`
}

/**
 * In a real world scenario you'd want to avoid creating refs in a global scope like this as they might not be cleaned up properly.
 * @type {{draggedType: Ref<string|null>, isDragOver: Ref<boolean>, isDragging: Ref<boolean>}}
 */
const state = {
    /**
     * The type of the node being dragged
     */
    draggedType: ref(null),
    isDragOver: ref(false),
    isDragging: ref(false),
}

export default function useDragAndDrop() {
    const { draggedType, isDragOver, isDragging } = state

    const { addNodes, screenToFlowCoordinate, onNodesInitialized, updateNode } = useVueFlow()

    watch(isDragging, (dragging) => {
        /**
         * https://developer.mozilla.org/en-US/docs/Web/CSS/user-select
         * The user-select CSS property controls whether the user can select text. 
         * So, if the node is being dragged, the user won't be able to select the text
         */
        document.body.style.userSelect = dragging ? 'none' : ''
    })

    function onDragStart(event, type) {
        if (event.dataTransfer) {
            event.dataTransfer.setData('application/vueflow', type)
            event.dataTransfer.effectAllowed = 'move'

            draggedType.value = type
            isDragging.value = true

            document.addEventListener('drop', onDragEnd)
        }
    }

    function onDragEnd() {
        isDragOver.value = false
        isDragging.value = false
        draggedType.value = null
        document.removeEventListener('drop', onDragEnd)
    }

    return { onDragStart }
}

