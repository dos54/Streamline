<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useHead } from '@unhead/vue'
import { useVueFlow } from '@vue-flow/core'
import type { Node, Edge, NodeChange } from '@vue-flow/core'

import CanvasView from '@/components/CanvasView.vue'
import NodeSidebar from '@/components/sidebar/NodeSidebar.vue'
import SettingsModal from '@/components/modals/SettingsModal.vue'
import JsonImport from '@/components/JsonImport.vue'
import useDragAndDrop from '@/useDnD'
import { useProjectStore } from '@/stores/project.store'

useHead({ title: 'Editor' })

const projectStore = useProjectStore()

// Only load project once when component mounts
let isInitialized = false
onMounted(async () => {
  if (!isInitialized) {
    isInitialized = true
    await projectStore.ensureExists('new-project')
  }
})

const toFlowNode = (n: (typeof projectStore.current)['nodes'][number]): Node => ({
  id: n.id,
  type: 'producer',
  position: n.position,
  data: {
    label: n.name,
    cycleTime: n.cycleTime,
    inputs: n.inputs,
    outputs: n.outputs,
    resources: n.data?.resources ?? [],
    direction: 'ltr',
  },
})

function handleInject(nodes: Node[]) {
  const mappedNodes = nodes.map((node) => ({
    id: node.id,
    type: "producer" as const,
    name: node.data?.label ?? '',
    enabled: true,
    position: node.position,
    count: node.data?.count ?? 1,
    cycleTime: node.data?.cycleTime ?? 1,
    mode: node.type as 'producer' | 'consumer' | 'transformer',
    inputs: node.data?.inputs ?? [],
    outputs: node.data?.outputs ?? [],
    resources: node.data?.resources ?? [],
    data: node.data,
  }))
  projectStore.injectNodes(mappedNodes)
}

function handleClear() {
  projectStore.clearNodes()
}

// Fixed: use projectStore.current.nodes instead of projectStore.nodes
const flowNodes = computed<Node[]>(() =>
  projectStore.current.nodes.map(toFlowNode)
)

const flowEdges = computed<Edge[]>(() =>
  projectStore.current.edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
    label: e.label,
    data: e.data,
  }))
)

const { addNodes, addEdges, screenToFlowCoordinate } = useVueFlow()
const { onDragOver, onDrop: onDropHandler } = useDragAndDrop()

function onDrop(event: DragEvent) {
  onDropHandler(event, screenToFlowCoordinate)
}

function onNodesChange(changes: NodeChange[]) {
  for (const c of changes) {
    if (c.type === 'position' && 'id' in c) {
      if (c.dragging === false || c.dragging === undefined) {
        const pos = (c as { position?: { x: number; y: number } }).position
        if (pos) projectStore.updateNodePosition(c.id, pos)
      }
    }
  }
}


</script>

<template>
  <div class="editor-layout" @dragover="onDragOver" @drop="onDrop">
    <NodeSidebar />
    <CanvasView :nodes="flowNodes" :edges="flowEdges" @connect="addEdges" @nodesChange="onNodesChange" />
    <JsonImport @inject="handleInject" @clear="handleClear" />
    <SettingsModal />
  </div>
</template>

<style scoped>
.editor-layout {
  display: flex;
  width: 100%;
  height: 100%;
}
</style>
