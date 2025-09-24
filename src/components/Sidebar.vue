<script setup>
import useDragAndDrop from './useDnD'

const {onDragStart} = useDragAndDrop()
</script>

<template>
    <aside>
        <div>
            You can drag these nodes to the pane
        </div>

        <div>
            <div>
                <div :draggable="true" @dragstart="onDragStart($event, 'input')" class="vue-flow__node-input">
                    Input Node
                </div>
            </div>
            <div >
                <div :draggable="true" @dragstart="onDragStart($event, 'deafult')" class="vue-flow__node-default">
                    Default Node
                </div>
            </div>
            <div >
                <div :draggable="true" @dragstart="onDragStart($event, 'output')" class="vue-flow__node-output">
                    Output Node
                </div>
            </div>
        </div>
    </aside>
</template>