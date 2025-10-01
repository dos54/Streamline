<script setup lang="ts">
import CanvasView from '@/components/CanvasView.vue';
import NodeSidebar from '@/components/sidebar/NodeSidebar.vue';
import SettingsModal from '@/components/modals/SettingsModal.vue';
import { useHead } from '@unhead/vue';
useHead({title: 'Editor'})
</script>

<template>
  <div class="editor-layout">
    <NodeSidebar />
    <CanvasView />
  </div>

  <SettingsModal />
</template>

<style scoped>
.editor-layout {
  display: flex;
  width: 100%;
  height: 100%;
}
</style>

