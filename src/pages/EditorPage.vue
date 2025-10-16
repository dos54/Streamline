<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useHead } from '@unhead/vue'
import { useVueFlow } from '@vue-flow/core'
import type { Node as VFNode, Edge, NodeChange, Connection } from '@vue-flow/core'

import CanvasView from '@/components/CanvasView.vue'
import NodeSidebar from '@/components/sidebar/NodeSidebar.vue'
import SettingsModal from '@/components/modals/SettingsModal.vue'
import JsonImport from '@/components/JsonImport.vue'
import useDragAndDrop from '@/useDnD'
import { useProjectStore } from '@/stores/project.store'
import type { GraphNode } from '@/types/graphNode'

useHead({ title: 'Editor' })

const projectStore = useProjectStore()

let isInitialized = false
onMounted(async () => {
  if (!isInitialized) {
    isInitialized = true
    await projectStore.ensureExists('new-project')
  }
})

const selectedNode = ref<GraphNode | null>(null)

function handleNodeClick(node: VFNode) {
  const found = projectStore.nodeById(node.id)
  selectedNode.value = found ?? null
}

const toFlowNode = (n: (typeof projectStore.current)['nodes'][number]): VFNode => ({
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

function handleInject(nodes: VFNode[]) {
  const mappedNodes = nodes.map((node) => ({
    id: node.id,
    type: 'producer' as const,
    name: node.data?.label ?? '',
    enabled: true,
    position: node.position,
    count: node.data?.count ?? 1,
    cycleTime: node.data?.cycleTime ?? 1,
    mode: node.type as 'producer' | 'consumer' | 'transformer',
    inputs: node.data?.inputs ?? [],
    outputs: node.data?.outputs ?? [],
    resources: node.data?.resources ?? [],
    data: { resources: node.data?.resources ?? [] },
  }))
  projectStore.injectNodes(mappedNodes)
}

function handleClear() {
  projectStore.clearNodes()
}

const flowNodes = computed<VFNode[]>(() => projectStore.current.nodes.map(toFlowNode))

const flowEdges = computed<Edge[]>(() =>
  projectStore.current.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
    label: e.label,
    data: e.data,
  })),
)

const { addEdges, screenToFlowCoordinate } = useVueFlow()
const { onDragOver, onDrop: onDropHandler } = useDragAndDrop()

function onDrop(event: DragEvent) {
  onDropHandler(event, screenToFlowCoordinate)
}

function onNodesChange(changes: NodeChange[]) {
  for (const c of changes) {
    if (c.type === 'position' && 'id' in c) {
      if (c.dragging === true) {
        const pos = (c as { position?: { x: number; y: number } }).position
        if (pos) projectStore.updateNodePosition(c.id, pos)
      }
    }
  }
}

function onAddEdge(edge: Connection) {
  const connection = {
    ...edge,
    id: String(crypto.randomUUID()),
    enabled: true,
    sourceHandle: edge.sourceHandle ?? '',
    targetHandle: edge.targetHandle ?? '',
  }
  addEdges(connection)
  projectStore.upsertEdge(connection)
}
</script>

<template>
  <div class="editor-layout" @dragover="onDragOver" @drop="onDrop">
    <NodeSidebar :node="selectedNode" />
    <CanvasView
      :nodes="flowNodes"
      :edges="flowEdges"
      @connect="onAddEdge"
      @nodesChange="onNodesChange"
      @nodeClick="handleNodeClick"
    />
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
