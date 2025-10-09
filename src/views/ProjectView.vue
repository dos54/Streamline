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

const route = useRoute()
const projectStore = useProjectStore()

const { addNodes, addEdges, screenToFlowCoordinate, getNodeTypes, getNodes} = useVueFlow()
const { onDragOver, onDrop: onDropHandler } = useDragAndDrop()

function onDrop(event: DragEvent) {
  const newNode = onDropHandler(event, screenToFlowCoordinate)
  if (newNode) {
    // convert to GraphNode type before upserting
    const newGraphNode = convertNodeToGraphNode(newNode) 

    projectStore.upsertNode(newGraphNode)

  }
}

function convertNodeToGraphNode(node: Node): GraphNode {
  return {
    id: node.id,
    type: node.type === 'consumer' ? 'sink' : 'source',
    name: node.data?.label, // use label as name
    enabled: false, // false by default
    position: {
      x: node.position.x,
      y: node.position.y,
    },
    count: 0, // init as zero 
    cycleTime: node.type === 'producer' ? node?.data?.cycleTime : 0,
    inputs: [{
      id: node.data?.inputs[0]?.resourceId ?? 'input-1',
      perCycle: node?.data?.inputs[0]?.perCycle ?? 1,
      consumptionChance: node.type === 'consumer' ? 1 : 0, // no chance for producer
      label: node.data?.label,
      unitId: node.data?.inputs[0]?.resourceId,
    }],
    outputs: [{
      id: 'output-1', perCycle: node?.data?.inputs[0]?.perCycle ?? 1, consumptionChance: node.type === 'consumer' ? 1 : 0,
    }]
  } 
}

function onConnect(params: Connection) {
  projectStore.upsertEdge({
    ...params, source: params.source, target: params.target, sourceHandle: '', targetHandle: '',
    id: '',
    enabled: false
  })
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

// ✅ Inject test edge once project is loaded
watchEffect(() => {
  if (projectStore.projectLoaded) {
    console.log('Project loaded?', !!projectStore.current)
    console.log('Units:', projectStore.units)
    console.log('Resources:', projectStore.resources)

    // Replace these IDs with actual node IDs from your JSON
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
