<template>
  <div class="canvas-wrapper">
    <VueFlow
      v-model:nodes="nodes"
      :fit-view="true"
      :zoom-on-scroll="true"
      :pan-on-drag="true"
      class="vue-flow-canvas"
    >
      <Background variant="dots" :gap="20" :size="1" />
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'

const nodes = ref([
  {
    id: '1',
    type: 'default',
    position: { x: 250, y: 150 },
    data: { label: 'This is our Canvas' },
  },
])
</script>

<style scoped>
.canvas-wrapper {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.vue-flow-canvas {
  background-color: #f0f0f0;
}
</style>
