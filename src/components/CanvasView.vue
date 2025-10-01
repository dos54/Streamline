<template>
  <div class="canvas-wrapper">
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :node-types="nodeTypes"
      :zoom-on-scroll="true"
      :pan-on-drag="true"
      @pane-ready="handlePaneReady"
      class="fill"
    >
      <Background variant="dots" :gap="20" :size="1" />
    </VueFlow>

    <CanvasOverlay />

    <!-- Floating JSON Import Panel -->
    <JsonImport @inject="replaceCanvasNodes" @clear="clearCanvas" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import type { NodeTypesObject, Node, Edge } from '@vue-flow/core'
import type { Component } from 'vue'
import { Background } from '@vue-flow/background'

import ProducerNode from '../nodes/ProducerNode.vue'
import ConsumerNode from '../nodes/ConsumerNode.vue'
import CanvasOverlay from './overlay/CanvasOverlay.vue'
import SmartNode from '../nodes/SmartNode.vue'
import JsonImport from '../components/JsonImport.vue'

const { fitView, addNodes, removeNodes } = useVueFlow()

function handlePaneReady() {
  fitView({ padding: 0.2 })
}

function replaceCanvasNodes(json: Node[]) {
  removeNodes()
  addNodes(json)
}

function clearCanvas() {
  console.log('Clearing canvas...')
  nodes.value = []
  edges.value = []
}


const nodeTypes: NodeTypesObject = {
  producer: ProducerNode as Component,
  consumer: ConsumerNode as Component,
  smart: SmartNode as Component,
}

type OutputResource = {
  resourceId: string
  unitId: string
  perCycle: number
}

const edges = ref<Edge[]>([
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

const nodes = ref<Node[]>([
  {
    id: 'producer-1',
    type: 'producer',
    position: { x: 100, y: 200 },
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
  },
  {
    id: 'smart-1',
    type: 'smart',
    position: { x: 250, y: 400 },
    data: {
      label: 'Smart Node',
      mode: 'transformer',
      direction: 'ltr',
      cycleTime: 3,
      inputs: [],
      outputs: [],
      resources: [
        { id: 'power', name: 'Electricity', defaultUnitId: 'kWh' },
        { id: 'steel', name: 'Steel', defaultUnitId: 'kg' }
      ]
    }
  }
])

function validateResourceFlow(nodes: Node[], edges: Edge[]) {
  const nodeMap = new Map(nodes.map(node => [node.id, node]))
  const results = []

  for (const edge of edges) {
    const source = nodeMap.get(edge.source)
    const target = nodeMap.get(edge.target)

    if (!source || !target) continue

    const outputs = (source.data.outputs ?? []) as OutputResource[]
    const inputs = (target.data.inputs ?? []) as OutputResource[]

    for (const input of inputs) {
      const match = outputs.find(
        output =>
          output.resourceId === input.resourceId &&
          output.unitId === input.unitId &&
          output.perCycle >= input.perCycle
      )

      results.push({
        edgeId: edge.id,
        target: edge.target,
        resourceId: input.resourceId,
        valid: !!match,
        message: match
          ? `✅ ${input.resourceId} is sufficiently supplied`
          : `⚠️ ${input.resourceId} is missing or under-supplied`
      })
    }
  }

  return results
}

const validationResults = computed(() =>
  validateResourceFlow(nodes.value, edges.value)
)

watchEffect(() => {
  const results = validationResults.value

  for (const node of nodes.value) {
    if (node.type === 'consumer') {
      const nodeResults = results.filter(r => r.target === node.id)
      const messages = nodeResults.map(r => r.message)
      const allValid = nodeResults.every(r => r.valid)
      const statusColor = allValid ? '#4caf50' : '#f44336'

      node.data.statusMessages = messages
      node.data.statusColor = statusColor
    }
  }

  for (const edge of edges.value) {
    const edgeResults = results.filter(r => r.edgeId === edge.id)
    const isValid = edgeResults.every(r => r.valid)

    edge.data = edge.data || {}
    edge.data.valid = isValid

    edge.style = {
      stroke: isValid ? '#4caf50' : '#f44336',
      strokeWidth: 2
    }

    edge.labelStyle = {
      fill: isValid ? '#4caf50' : '#f44336',
      fontWeight: 'bold',
      fontSize: 12
    }
  }
})
</script>

<style scoped>
.canvas-wrapper {
  flex: 1;
  height: 100vh;
}

.fill {
  width: 100%;
  height: 100%;
}
</style>
