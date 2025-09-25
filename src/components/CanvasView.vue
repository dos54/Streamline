<template>
  <div class="canvas-wrapper">
    <VueFlow
      v-model:nodes="nodes"
      :node-types="nodeTypes"
      :zoom-on-scroll="true"
      :pan-on-drag="true"
      @pane-ready="handlePaneReady"
      class="fill"
    >
      <Background variant="dots" :gap="20" :size="1" />
    </VueFlow>
    <CanvasOverlay />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import type { NodeTypesObject } from '@vue-flow/core'
import type { Component } from 'vue'
import { Background } from '@vue-flow/background'

import ProducerNode from '../nodes/ProducerNode.vue'
import ConsumerNode from '../nodes/ConsumerNode.vue'
import CanvasOverlay from './overlay/CanvasOverlay.vue'

const { fitView } = useVueFlow()

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
</script>

<style scoped>
.canvas-wrapper {
  width: 100svw;
  height: 100svh;
}

.fill {
  width: 100%;
  height: 100%;
}
</style>
