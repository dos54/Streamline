<template>
  <div class="toolbar">
    <button class="settings-button" @click="ui.openSettings()">
      <img :src="base + 'images/icons/settings-icon.svg'" class="settings-icon" alt="" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui.store'
const ui = useUiStore()

const base = import.meta.env.BASE_URL
</script>

<style scoped>
.toolbar {
  position: absolute;
  top: 8px;
  left: 258px; /* 250px sidebar width + 8px margin */
  pointer-events: auto;

  background-color: var(--overlay-bg);
  border-radius: var(--overlay-border-radius);
  border: var(--overlay-border-settings);
}

.settings-button {
  padding: 0;
  margin: 0;
  background-color: rgba(0, 0, 0, 0);
  border: none;
  border-radius: 100px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.settings-button:hover {
  background-color: var(--primary-hover);
}

.settings-icon {
  width: 48px;
  height: 48px;
  margin: 2px;
  padding: 0;
}
</style>
