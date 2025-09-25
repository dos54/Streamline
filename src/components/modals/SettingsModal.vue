<script setup lang="ts">
import { onMounted, onBeforeMount } from 'vue'
import { useUiStore } from '@/stores/ui.store'
import { storeToRefs } from 'pinia'
const ui = useUiStore()
const { settingsOpen } = storeToRefs(ui)

function onClose() {
  ui.closeSettings()
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') onClose()
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeMount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <teleport to="body">
    <div v-if="settingsOpen" @click.self="onClose" class="backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-label="Settings">
        <header class="modal-header">
          <h2>Settings</h2>
          <button class="icon" @click="onClose" aria-label="Close">✕</button>
        </header>

        <section class="modal-body">
          <p>Here are some settings for you to explore!</p>
        </section>

        <footer class="modal-footer">
          <button class="close-modal" @click="onClose">Close</button>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.backdrop {
  position: absolute;
  inset: 0;
  pointer-events: all;

  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(30, 30, 30, 0.5);
}

.modal {
  background-color: white;
  width: clamp(200px, 500px, 80%);
  height: clamp(200px, 500px, 80%);
  padding: 0 0.5rem;
  border-radius: 12px;
  border: 2px solid gray;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid lightgray;
  align-items: center;
}

.modal-body {
  height: 100%;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: center;

  height: 48px;
  padding-bottom: 4px;
}

.close-modal {
  border: 2px solid lightgray;
  border-radius: 8px;
  height: 100%;
  cursor: pointer;
  width: clamp(48px, 100%, 300px)
}

.icon {
  padding: 0;
  margin: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
}
</style>
