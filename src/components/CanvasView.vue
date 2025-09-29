<template>
  <div class="canvas-wrapper" @drop="onDrop" @dragover.prevent="onDragOver" @dragleave="onDragLeave">
    <VueFlow
      v-model:nodes="nodes" 
      :node-types="nodeTypes"
      :zoom-on-scroll="true"
      :pan-on-drag="true"
      @pane-ready="handlePaneReady"
      class="vue-flow-canvas"
    >
      <DropzoneBackground>
        <p v-if="isDragOver" class="drop-text">Drop here</p>
      </DropzoneBackground>
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import type { NodeTypesObject } from '@vue-flow/core'
import type { Component } from 'vue'
import { Background } from '@vue-flow/background'
import DropzoneBackground from './DropzoneBackground.vue'

import useDragAndDrop from './useDnD'

import ProducerNode from '../nodes/ProducerNode.vue'
import ConsumerNode from '../nodes/ConsumerNode.vue'

const { onDragOver, onDrop, onDragLeave, isDragOver } = useDragAndDrop()


function handlePaneReady() {
  fitView({ padding: 0.2 }) // This makes it so it only runs once on load
}

const nodeTypes: NodeTypesObject = {
  producer: ProducerNode as Component,
  consumer: ConsumerNode as Component,
}

const nodes = ref([
  {
    id: 'producer-1',
    type: 'producer',
    position: { x: 100, y: 200 },
    data: { label: 'Iron Mine' },
  },
  {
    id: 'consumer-1',
    type: 'consumer',
    position: { x: 400, y: 200 },
    data: { label: 'Smelter' },
  },
])

const { fitView, onConnect, addEdges } = useVueFlow()
onConnect(addEdges)

</script>

<style scoped>
.canvas-wrapper {
  width: 100%;
  height: 100vh;
  position: relative;
  background-color: #f0f0f0;
}

.vue-flow-canvas {
  width: 100%;
  height: 100%;
  background-color: #fd0000;
}

.drop-text {
  position: absolute;
  top: 50%;
  left:50%;
  transform: translate(-50%,-50%);
  font-weight: bold;
  color: #1add3b
}
</style>
