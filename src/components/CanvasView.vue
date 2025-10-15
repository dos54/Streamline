<template>
  <div class="canvas-wrapper">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      :node-types="nodeTypes"
      :zoom-on-scroll="true"
      :pan-on-drag="true"
      @pane-ready="handlePaneReady"
      @connect="emitConnect"
      @nodes-change="emitNodesChange"
      class="fill"
    >
      <Background variant="dots" :gap="20" :size="1" />
    </VueFlow>
    <CanvasOverlay />
  </div>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import type { NodeTypesObject, Node, Edge, Connection, NodeChange } from '@vue-flow/core'
import type { Component } from 'vue'
import { Background } from '@vue-flow/background'

import ProducerNode from '../nodes/ProducerNode.vue'
import ConsumerNode from '../nodes/ConsumerNode.vue'
import CanvasOverlay from './overlay/CanvasOverlay.vue'
import SmartNode from '../nodes/SmartNode.vue'

const props = defineProps<{
  nodes: Node[]
  edges: Edge[]
}>()

const emit = defineEmits<{
  (e: 'connect', payload: Connection): void
  (e: 'nodesChange', payload: NodeChange[]): void
}>()

function emitConnect(params: Connection) {
  emit('connect', params)
}
function emitNodesChange(changes: NodeChange[]) {
  emit('nodesChange', changes)
}

const { fitView } = useVueFlow()

function handlePaneReady() {
  requestAnimationFrame(() => {
    fitView({ padding: 0.2 })
  })
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

function validateResourceFlow(nodes: Node[], edges: Edge[]) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const results = []

  for (const edge of edges) {
    const source = nodeMap.get(edge.source)
    const target = nodeMap.get(edge.target)

    if (!source || !target) continue

    const outputs = source.data.outputs ?? []
    const inputs = target.data.inputs ?? []

    for (const input of inputs) {
      const match = outputs.find(
        (output: OutputResource) =>
          output.resourceId === input.resourceId &&
          output.unitId === input.unitId &&
          output.perCycle >= input.perCycle,
      )

      results.push({
        edgeId: edge.id,
        target: edge.target,
        resourceId: input.resourceId,
        valid: !!match,
        message: match
          ? `✅ ${input.resourceId} is sufficiently supplied`
          : `⚠️ ${input.resourceId} is missing or under-supplied`,
      })
    }
  }

  return results
}

watchEffect(() => {
  const results = validateResourceFlow(props.nodes, props.edges)

  for (const node of props.nodes) {
    if (node.type === 'consumer') {
      const nodeResults = results.filter((r) => r.target === node.id)
      const messages = nodeResults.map((r) => r.message)
      const allValid = nodeResults.every((r) => r.valid)
      const statusColor = allValid ? '#4caf50' : '#f44336'

      node.data.statusMessages = messages
      node.data.statusColor = statusColor
    }
  }

  for (const edge of props.edges) {
    const edgeResults = results.filter((r) => r.edgeId === edge.id)
    const isValid = edgeResults.every((r) => r.valid)

    edge.data = edge.data || {}
    edge.data.valid = isValid

    edge.style = {
      stroke: isValid ? '#4caf50' : '#f44336',
      strokeWidth: 2,
    }

    edge.labelStyle = {
      fill: isValid ? '#4caf50' : '#f44336',
      fontWeight: 'bold',
      fontSize: 12,
    }
  }
})
</script>

<style scoped>
.editor-layout {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
}

.canvas-wrapper {
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
}

.fill {
  width: 100%;
  height: 100%;
}
</style>
