<template>
  <div class="overlay-root" :style="overlayVars">
    <!-- Overlay components here -->
    <EditorToolbar />
    <OverlayLogo />
    <OverlayLinks />
    <NodeSidebar />
  </div>
</template>

<script setup lang="ts">
import OverlayLogo from '@/components/overlay/OverlayLogo.vue'
import OverlayLinks from '@/components/overlay/OverlayLinks.vue'
import EditorToolbar from './EditorToolbar.vue'
//import NodeSidebar from '@/components/sidebar/NodeSidebar.vue'

const overlayVars = {
  '--overlay-bg': 'var(--on-bg)',
  '--overlay-border-radius': 'var(--radius-lg)',
  '--overlay-border-settings': 'var(--border-full-1)'
}
</script>

<style scoped>
.overlay-root {
  /* Positioning */
  position: absolute;
  inset: 0;
  pointer-events: none;
}
</style>
