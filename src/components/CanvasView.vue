<template>
  <div class="canvas-wrapper">
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges" 
      :node-types="nodeTypes"
      :zoom-on-scroll="true"
      :pan-on-drag="true"
      @pane-ready="handlePaneReady"
      class="vue-flow-canvas"
    >
      <Background variant="dots" :gap="20" :size="1" />
    </VueFlow>
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

const { fitView } = useVueFlow()

function handlePaneReady() {
  fitView({ padding: 0.2 })
}

const nodeTypes: NodeTypesObject = {
  producer: ProducerNode as Component,
  consumer: ConsumerNode as Component,
}

const edges = ref([
  {
    id: 'e1',
    source: 'producer-1',
    target: 'consumer-1',
    label: 'Electricity',
    animated: true,
    style: { stroke: '#999' },
    labelStyle: { fill: '#333', fontSize: 12 }
  }
])



const nodes = ref([
  {
    id: 'producer-1',
    type: 'producer',
    position: { x: 100, y: 200 },
    data: {
      label: 'Iron Mine',
      direction: 'ltr',
      inputs: [
        { resourceId: 'power', unitId: 'kWh', perCycle: 0.5 },
        { resourceId: 'steel', unitId: 'kg', perCycle: 2 }
      ],
      resources: [
        { id: 'power', name: 'Electricity', defaultUnitId: 'kWh' },
        { id: 'steel', name: 'Steel', defaultUnitId: 'kg' }
      ]
    }
  },
  {
    id: 'consumer-1',
    type: 'consumer',
    position: { x: 400, y: 200 },
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
])
</script>

<style scoped>
.canvas-wrapper {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.vue-flow-canvas {
  background-color: #f0f0f0;
}
</style>
