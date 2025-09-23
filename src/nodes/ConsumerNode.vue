<template>
  <div class="consumer-node">
    <div class="header">
      Consumer
    </div>

    <input
      class="label-input"
      v-model="editableLabel"
      @blur="updateLabel"
      placeholder="Enter name"
    />

    <div class="inputs-section">
      <h3>Inputs</h3>
      <ul>
        <li v-for="(input, index) in data.inputs" :key="index">
          {{ input.resourceId }}: {{ input.perCycle }} {{ input.unitId }}
        </li>
      </ul>
    </div>

    <Handle type="target" :position="inputPosition" />
    <Handle type="source" :position="outputPosition" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{
  data: {
    label: string
    direction?: 'ltr' | 'rtl'
    inputs: {
      resourceId: string
      unitId: string
      perCycle: number
    }[]
  }
}>()

const data = props.data

const editableLabel = ref(data.label)
const currentDirection = ref(data.direction || 'ltr')

function updateLabel() {
  data.label = editableLabel.value
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
  background-color: #fff3e6; /* soft orange */
  border: 2px solid #f5b97d;
  border-radius: 8px;
  padding: 1rem;
  width: 240px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', sans-serif;
}

.header {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: #333;
}

.label-input {
  width: 100%;
  padding: 6px 8px;
  font-size: 0.95rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.inputs-section {
  margin-top: 1rem;
  background-color: #fef7f0;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #f5d9b0;
}

.inputs-section h3 {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #555;
}
</style>
