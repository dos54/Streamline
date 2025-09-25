<script setup lang="ts">
import CanvasView from '@/components/CanvasView.vue';
import SettingsModal from '@/components/modals/SettingsModal.vue';
import { useHead } from '@unhead/vue';
useHead({title: 'Editor'})
</script>

<template>
  <CanvasView />

  <SettingsModal />
</template>

