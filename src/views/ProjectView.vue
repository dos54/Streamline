<template>
  <div v-if="projectStore.current" @dragover="onDragOver" @drop="onDrop">
    <CanvasView :nodes="projectStore.nodes" :edges="projectStore.edges" @connect="onConnect" />
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
  id?: string
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
  const safeType = (node.type === 'smart' || node.type === 'producer' || node.type === 'consumer')
    ? node.type
    : 'smart'

  const safeMode = safeType === 'smart' ? 'transformer' : safeType

  return {
    id: node.id,
    type: safeType,
    name: String(node.data?.label ?? 'Unnamed Node'),
    enabled: true,
    position: node.position,
    count: 1,
    cycleTime: typeof node.data?.cycleTime === 'number' ? node.data.cycleTime : 1,
    mode: safeMode,
    inputs: Array.isArray(node.data?.inputs)
      ? node.data.inputs.map((input: ResourceFlow) => ({
        resourceId: input.resourceId,
        unitId: input.unitId,
        perCycle: input.perCycle
      }))
      : [],

    outputs: Array.isArray(node.data?.outputs)
      ? node.data.outputs.map((output: ResourceFlow) => ({
        id: output.id ?? output.resourceId,
        resourceId: output.resourceId,
        unitId: output.unitId,
        perCycle: output.perCycle
      }))
      : [],

    tags: [],
    ui: {},
    data: {
      resources: node.data?.resources ?? [],
      statusMessages: [],
      statusColor: '#999'
    }
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

    //const sourceId = 'test-node'
    //const targetId = 'consumer-node'


    const sourceId = 'node-1' // or dynamically from your logic
    const targetId = 'node-2' // or dynamically from your logic

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
