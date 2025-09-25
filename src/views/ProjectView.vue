<template>
  <div v-if="projectStore.current">
    <CanvasView />
  </div>
  <div v-else class="loading">
    <span class="spinner"></span>
    <span>Loading project...</span>
  </div>
</template>

<script setup lang="ts">
import CanvasView from '@/components/CanvasView.vue'
import { onMounted, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/project.store'

const route = useRoute()
const projectStore = useProjectStore()

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
  console.log('Project loaded?', !!projectStore.current)
  console.log('Units:', projectStore.units)
  console.log('Resources:', projectStore.resources)
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
