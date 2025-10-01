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
  <JsonImport @inject="handleInject" @clear="handleClear" />
  <CanvasView />
  <SettingsModal />
</template>
