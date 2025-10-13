<template>
  <div class="toolbar">
    <button class="toolbar-button" @click="exportCanvas" title="Export Canvas as Image">
      <svg
        class="toolbar-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7,10 12,15 17,10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    </button>
    <button class="toolbar-button" @click="ui.openSettings()" title="Settings">
      <img :src="base + 'images/icons/settings-icon.svg'" class="toolbar-icon" alt="" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui.store'
import { useProjectStore } from '@/stores/project.store'
import { useVueFlow } from '@vue-flow/core'
import { exportVueFlowCanvasWithBounds } from '@/utils/imageExport'

const ui = useUiStore()
const project = useProjectStore()
const base = import.meta.env.BASE_URL

async function exportCanvas() {
  const vueFlowElement = document.querySelector('.vue-flow') as HTMLElement
  if (!vueFlowElement) {
    console.error('Vue Flow canvas not found')
    return
  }

  try {
    // Get Vue Flow instance to access node positions
    const { getNodes } = useVueFlow()
    const nodes = getNodes.value

    const result = await exportVueFlowCanvasWithBounds(vueFlowElement, nodes, project.current?.name)
    if (result.success) {
      console.log(`Canvas exported as ${result.filename}`)
    } else {
      console.error('Export failed:', result.error)
    }
  } catch (error) {
    console.error('Export error:', error)
  }
}
</script>

<style scoped>
.toolbar {
  position: absolute;
  top: 8px;
  left: 258px; /* 250px sidebar width + 8px margin */
  pointer-events: auto;
  display: flex;
  gap: 4px;

  background-color: var(--overlay-bg);
  border-radius: var(--overlay-border-radius);
  border: var(--overlay-border-settings);
}

.toolbar-button {
  padding: 0;
  margin: 0;
  background-color: rgba(0, 0, 0, 0);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  transition: background-color 0.2s ease;
}

.toolbar-button:hover {
  background-color: var(--primary-hover);
}

.toolbar-icon {
  width: 24px;
  height: 24px;
  color: currentColor;
}

.toolbar-button img.toolbar-icon {
  width: 24px;
  height: 24px;
}
</style>
