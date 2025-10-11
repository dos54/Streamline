<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import CanvasView from '@/components/CanvasView.vue'
import NodeSidebar from '@/components/sidebar/NodeSidebar.vue'
import SettingsModal from '@/components/modals/SettingsModal.vue'
import JsonImport from '@/components/JsonImport.vue'
import { useHead } from '@unhead/vue'
import useDragAndDrop from '@/useDnD'
import { useProjectStore } from '@/stores/project.store'

useHead({ title: 'Editor' })

const projectStore = useProjectStore()
const showImportPanel = ref(false)

function handleInject(nodes: any[]) {
  projectStore.injectNodes(nodes)
}

function handleClear() {
  projectStore.clearNodes()
}

const { addNodes, addEdges, screenToFlowCoordinate } = useVueFlow()
const { onDragOver, onDrop: onDropHandler } = useDragAndDrop()

function onDrop(event: DragEvent) {
  const newNode = onDropHandler(event, screenToFlowCoordinate)
  if (newNode) {
    addNodes([newNode])
  }
}

onMounted(() => {
  // No sampleNodes injected — canvas starts clean
})
</script>

<template>
  <div class="editor-layout" @dragover="onDragOver" @drop="onDrop">
    <NodeSidebar
      @show-import="showImportPanel = true"
      @reset-canvas="projectStore.clearNodes()"
    />

    <div class="canvas-container">
      <CanvasView
        :nodes="projectStore.nodes"
        :edges="projectStore.edges"
        @connect="addEdges"
      />
    </div>

    <JsonImport
      v-if="showImportPanel"
      @inject="handleInject"
      @clear="handleClear"
    />
    <SettingsModal />
  </div>
</template>

<style scoped>
.editor-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

.canvas-container {
  flex: 1;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden; /* ✅ Prevents scrollbars from interfering with drag */
}
</style>

