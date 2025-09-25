<template>
  <div class="editor-root">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useHead } from '@unhead/vue';

useHead({titleTemplate: (t?: string) => (t ? `${t} • Streamline Flow` : 'Streamline Flow')})
</script>

<style scoped>
.editor-root {
  position: fixed;
  inset: 0;
  width: 100svw;
  height: 100svh;
  overflow: hidden;
}
</style>
