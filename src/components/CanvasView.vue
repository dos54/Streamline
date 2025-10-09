<template>
  <div class="editor-layout">
     class="canvas-wrapper"
  @drop="handleDrop"
  @dragover.prevent
>
  <VueFlow
    :nodes="nodes"
    :edges="edges"
    :node-types="nodeTypes"
    :zoom-on-scroll="true"
    :pan-on-drag="true"
    @pane-ready="handlePaneReady"
    @connect="onConnect"
    class="fill"
      >
        <Background variant="dots" :gap="20" :size="1" />
      </VueFlow>
      <CanvasOverlay />
    </div>

</template>

<script setup lang="ts">
import { computed, watchEffect, markRaw } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import type { NodeTypesObject, Node as FlowNode, Edge as FlowEdge, Connection } from '@vue-flow/core'
import type { Component, ConcreteComponent } from 'vue'
import { Background } from '@vue-flow/background'
import { useProjectStore } from '@/stores/project.store'

import ProducerNode from '../nodes/ProducerNode.vue'
import ConsumerNode from '../nodes/ConsumerNode.vue'
import CanvasOverlay from './overlay/CanvasOverlay.vue'
import SmartNode from '../nodes/SmartNode.vue'
import useDragAndDrop from '@/useDnD'
import { convertNodeToGraphNode } from '@/utils/graphUtils'

const projectStore = useProjectStore()
const { fitView, screenToFlowCoordinate } = useVueFlow()
const { onDrop, onDragOver } = useDragAndDrop()

function handleDrop(event: DragEvent) {
  const droppedNode = onDrop(event, screenToFlowCoordinate)

  if (!droppedNode || !droppedNode.type || !droppedNode.data) {
    console.warn('⚠️ Invalid node dropped:', droppedNode)
    return
  }

  const graphNode = convertNodeToGraphNode(droppedNode)

  projectStore.upsertNode(graphNode)
  projectStore.validateResourceFlow()

  console.log('📦 Injected node:', graphNode)
}

function handlePaneReady() {
  requestAnimationFrame(() => {
    fitView({ padding: 0.2 })
  })
}

function onConnect(params: Connection) {
  if (!params.sourceHandle || !params.targetHandle) {
    console.warn('❌ Missing handle IDs in connection:', params)
    return
  }

  const sourceNode = projectStore.nodeById(params.source)
  const output = sourceNode?.outputs?.find(o => o.id === params.sourceHandle)

  if (!output) {
    console.warn('⚠️ Could not find matching output for handle:', params.sourceHandle)
    return
  }

  projectStore.upsertEdge({
    id: `edge-${Date.now()}`,
    source: params.source,
    sourceHandle: params.sourceHandle,
    target: params.target,
    targetHandle: params.targetHandle,
    resourceId: output.resourceId,
    enabled: true
  })
}

const nodeTypes: NodeTypesObject = {
  producer: markRaw(ProducerNode) as Component,
  consumer: markRaw(ConsumerNode) as Component,
  smart: markRaw(SmartNode) as Component,
}

type OutputResource = {
  resourceId: string
  unitId: string
  perCycle: number
}

type ExtendedNode = FlowNode & {
  type: string
  data: {
    inputs?: OutputResource[]
    outputs?: OutputResource[]
    resources?: { id: string; name: string; defaultUnitId?: string }[]
    statusMessages?: string[]
    statusColor?: string
  }
}

type ExtendedEdge = FlowEdge & {
  data?: {
    valid?: boolean
  }
  style?: Record<string, any>
  labelStyle?: Record<string, any>
}

const nodes = computed(() => projectStore.nodes as ExtendedNode[])
const edges = computed(() => projectStore.edges as ExtendedEdge[])

function validateResourceFlow(nodes: ExtendedNode[], edges: ExtendedEdge[]) {
  const nodeMap = new Map(nodes.map(node => [node.id, node]))
  const results = []

  for (const edge of edges) {
    const source = nodeMap.get(edge.source)
    const target = nodeMap.get(edge.target)

    if (!source || !target) continue

    const outputs = source.data.outputs ?? []
    const inputs = target.data.inputs ?? []

    for (const input of inputs) {
      const match = outputs.find((output: OutputResource) =>
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

const balanceMap = computed(() => projectStore.balanceMap)

const balanceStatusMap = computed(() => {
  const map: Record<string, string> = {}

  for (const node of nodes.value) {
    if (node.type !== 'smart') continue

    const entries = balanceMap.value.filter(b => b.nodeId === node.id)

    if (entries.length === 0) {
      map[node.id] = 'missing'
      continue
    }

    let totalSupplied = 0
    let totalRequired = 0

    for (const entry of entries) {
      totalSupplied += entry.supplied
      totalRequired += entry.required
    }

    if (totalSupplied === totalRequired) map[node.id] = 'exact'
    else if (totalSupplied > totalRequired) map[node.id] = 'over'
    else if (totalSupplied < totalRequired) map[node.id] = 'under'
    else map[node.id] = 'valid'
  }

  return map
})

// Optional: expose these for SmartNode.vue to use
function getUnitsForResource(resourceId: string): string[] {
  const resource = projectStore.resources.find(r => r.id === resourceId)
  return resource ? [resource.defaultUnitId ?? ''] : []
}

function handleResourceChange(nodeId: string, inputIndex: number) {
  const node = projectStore.nodeById(nodeId)
  if (!node || !node.data?.inputs) return

  const selectedResourceId = node.data.inputs[inputIndex].resourceId
  const resource = node.data.resources?.find(r => r.id === selectedResourceId)

  if (resource) {
    node.data.inputs[inputIndex].unitId = resource.defaultUnitId ?? ''
  }
}

watchEffect(() => {
  const results = validationResults.value

  for (const node of nodes.value) {
    if (node.type === 'smart') {
      const status = balanceStatusMap.value[node.id]
      console.log(`🔍 SmartNode ${node.id} balance status:`, status)
    }

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
