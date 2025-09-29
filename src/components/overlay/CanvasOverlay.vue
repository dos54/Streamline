<template>
<div class="overlay-root" :style="overlayVars">
  <!-- Overlay components here -->
  <EditorToolbar />
  <OverlayLogo />
  <OverlayLinks />
  <SideBar />
</div>
</template>

<script setup lang="ts">
import OverlayLogo from '@/components/overlay/OverlayLogo.vue';
import OverlayLinks from '@/components/overlay/OverlayLinks.vue';
import EditorToolbar from './EditorToolbar.vue';

const overlayVars = {
  '--overlay-bg': 'rgba(240, 240, 240, .6)',
  '--overlay-border-radius': '12px',
  '--overlay-border-settings': '2px solid black'
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
