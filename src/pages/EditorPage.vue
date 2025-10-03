<script setup lang="ts">
import CanvasView from '@/components/CanvasView.vue'
import SettingsModal from '@/components/modals/SettingsModal.vue'
import JsonImport from '@/components/JsonImport.vue'
import { useHead } from '@unhead/vue'
import { useProjectStore } from '@/stores/project.store'


useHead({ title: 'Editor' })

const projectStore = useProjectStore()

function handleInject(nodes: any[]) {
  projectStore.injectNodes(nodes)
}

function handleClear() {
  projectStore.clearNodes()
}
</script>

<template>
  <div class="editor-layout">
    <NodeSidebar />
    <CanvasView />
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

