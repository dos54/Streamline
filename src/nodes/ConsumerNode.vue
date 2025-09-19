<template>
  <div class="consumer-node">
    <div class="header">
      Consumer
      <button @click="toggleDirection" class="direction-toggle">
        {{ currentDirection === 'ltr' ? '→' : '←' }}
      </button>
    </div>

    <input
      class="label-input"
      v-model="editableLabel"
      @blur="updateLabel"
      placeholder="Enter name"
    />

    <Handle type="target" :position="inputPosition" />
    <Handle type="source" :position="outputPosition" />
  </div>
</template>


<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{
  label: string
  direction?: 'ltr' | 'rtl'
}>()

const emit = defineEmits<{
  (e: 'update:label', value: string): void
  (e: 'update:direction', value: 'ltr' | 'rtl'): void
}>()

const editableLabel = ref(props.label)
const currentDirection = ref(props.direction || 'ltr')

watch(() => props.label, (newVal) => {
  editableLabel.value = newVal
})

function updateLabel() {
  emit('update:label', editableLabel.value)
}

function toggleDirection() {
  currentDirection.value = currentDirection.value === 'ltr' ? 'rtl' : 'ltr'
  emit('update:direction', currentDirection.value)
}

const inputPosition = computed(() =>
  currentDirection.value === 'rtl' ? Position.Right : Position.Left
)
const outputPosition = computed(() =>
  currentDirection.value === 'rtl' ? Position.Left : Position.Right
)
</script>


<style scoped>
.consumer-node {
  padding: 12px;
  border-radius: 8px;
  background-color: #fff3e0;
  border: 2px solid #ff9800;
  font-family: 'Segoe UI', sans-serif;
  width: 140px;
  text-align: center;
  position: relative;
}

.header {
  font-weight: bold;
  margin-bottom: 6px;
  color: #1565C0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label-input {
  width: 100%;
  border: none;
  background: transparent;
  text-align: center;
  font-size: 14px;
  font-family: inherit;
  color: #e65100;
  outline: none;
}

.direction-toggle {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #1565C0;
  padding: 0;
}
.direction-toggle:hover {
  color: #0d47a1;
}
</style>
