<template>
  <div v-if="projectStore.current" @dragover="onDragOver" @drop="onDrop">
    <CanvasView :nodes="projectStore.nodes" :edges="projectStore.edges" @connect="onConnect"/>
  </div>
  <div v-else class="loading">
    <span class="spinner"></span>
    <span>Loading project...</span>
  </div>
</template>

<script setup lang="ts">
import { useVueFlow } from '@vue-flow/core'
import type { Connection, Node } from '@vue-flow/core'
import useDragAndDrop from '@/useDnD'
import CanvasView from '@/components/CanvasView.vue'
import { onMounted, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/project.store'
import type { GraphNode } from '@/types/graphNode'

type ResourceFlow = {
  resourceId: string
  unitId: string
  perCycle: number
}

const route = useRoute()
const projectStore = useProjectStore()

const { addNodes, addEdges, screenToFlowCoordinate } = useVueFlow()
const { onDragOver, onDrop: onDropHandler } = useDragAndDrop()

function onDrop(event: DragEvent) {
  const newNode = onDropHandler(event, screenToFlowCoordinate)
  console.log('📦 Dropped node:', newNode)
  console.log('🧠 Injected SmartNode resources:', newNode?.data?.resources)

  if (newNode) {
    const newGraphNode = convertNodeToGraphNode(newNode)
    projectStore.upsertNode(newGraphNode)

    // ✅ Trigger validation after injection
    projectStore.validateResourceFlow()
  }
}

function convertNodeToGraphNode(node: Node): GraphNode {
  return {
    id: node.id,
    type: "smart",


    name: String(node.data?.label ?? "Unnamed Node"),
    enabled: false,
    position: {
      x: node.position.x,
      y: node.position.y,
    },
    count: 0,
    cycleTime: typeof node.data?.cycleTime === 'number' ? node.data.cycleTime : 0,
    mode: typeof node.type === 'string' &&
      ['producer', 'consumer', 'transformer', 'smart'].includes(node.type)
      ? (node.type === 'smart' ? 'transformer' : node.type) as 'producer' | 'consumer' | 'transformer'
      : 'producer',
    inputs: Array.isArray(node.data?.inputs)
      ? node.data.inputs.map((input: ResourceFlow) => ({
          resourceId: String(input.resourceId),
          unitId: String(input.unitId),
          perCycle: Number(input.perCycle)
        }))
      : [],
    outputs: Array.isArray(node.data?.outputs)
      ? node.data.outputs.map((output: ResourceFlow) => ({
          id: String(output.resourceId),
          resourceId: String(output.resourceId),
          unitId: String(output.unitId),
          perCycle: Number(output.perCycle)
        }))
      : []
  }
}

function onConnect(params: Connection) {
  projectStore.upsertEdge({
    ...params,
    source: params.source,
    target: params.target,
    sourceHandle: '',
    targetHandle: '',
    id: '',
    enabled: false
  })

  // ✅ Trigger validation after edge creation
  projectStore.validateResourceFlow()
}

onMounted(() => {
  const id = typeof route.params.id === 'string' ? route.params.id : ''
  if (!id) {
    console.warn('No project ID in route')
    return
  }
  console.log('Loading project with ID:', id)
  projectStore.load(id)
})

watchEffect(() => {
  if (projectStore.projectLoaded) {
    console.log('Project loaded?', !!projectStore.current)
    console.log('Units:', projectStore.units)
    console.log('Resources:', projectStore.resources)

    const sourceId = 'test-node'
    const targetId = 'consumer-node'
    console.log('Available nodes:', projectStore.nodes.map(n => n.id))

    const edgeExists = projectStore.edges.some(e => e.id === 'edge-1')
    if (!edgeExists) {
      projectStore.edges.push({
        id: 'edge-1',
        source: sourceId,
        target: targetId,
        sourceHandle: 'output-0',
        targetHandle: 'input-0',
        resourceId: 'water',
        enabled: true
      })
      console.log('✅ Injected edge between', sourceId, '→', targetId)

      // ✅ Trigger validation after edge injection
      projectStore.validateResourceFlow()
    }
  }
})
</script>

<style scoped>
.loading {
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: #555;
  padding: 1em;
}

.spinner {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid #ccc;
  border-top-color: #333;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-right: 0.5em;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
