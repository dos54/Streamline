<script setup>
import useDragAndDrop from './useDnD'

const {onDragStart} = useDragAndDrop()
</script>

<template>
    <aside>
        <div class="description">
            You can drag these nodes to the pane
        </div>

        <div class="nodes">
            <div class="vue-flow__node-input" :draggable="true" @dragstart="onDragStart($event, 'input')" >
                    Input Node
                </div>
            <div :draggable="true" @dragstart="onDragStart($event, 'deafult')" class="vue-flow__node-default">
                    Default Node
                </div>
            <div :draggable="true" @dragstart="onDragStart($event, 'output')" class="vue-flow__node-output">
                    Output Node
            </div>
        </div>
    </aside>
</template>