<template>
  <div class="editor-root">
    <RouterView />
    <JsonImport
      v-if="ui.importPanelVisible"
      @inject="handleInject"
      @clear="handleClear"
    />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useHead } from '@unhead/vue'
import JsonImport from '@/components/JsonImport.vue'
import { useUiStore } from '@/stores/ui.store'
import { useVueFlow } from '@vue-flow/core'

useHead({ titleTemplate: (t?: string) => (t ? `${t} • Streamline Flow` : 'Streamline Flow') })

const ui = useUiStore()
const { setNodes, setEdges, fitView } = useVueFlow()

function handleInject(nodes: any[]) {
  setNodes(nodes)
  setEdges([]) // Optional: clear edges if not included
  setTimeout(() => fitView({ padding: 0.2 }), 100)
}

function handleClear() {
  setNodes([])
  setEdges([])
}
</script>

<style scoped>
.editor-root {
  position: fixed;
  inset: 0;
  width: 100svw;
  height: 100svh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
