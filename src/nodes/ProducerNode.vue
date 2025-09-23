<template>
  <div class="producer-node">
    <div class="header">
      Producer
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

    <div class="inputs-section">
      <h3>Inputs</h3>
      <div v-if="data.inputs?.length">
  <ul>
  <li v-for="(input, index) in data.inputs" :key="index">
    {{ input.resourceId }}: {{ input.perCycle }} {{ input.unitId }}
  </li>
</ul>


      </div>
      <div v-else>
        <p>No inputs defined</p>
      </div>
    </div>

    <Handle type="target" :position="inputPosition" />
    <Handle type="source" :position="outputPosition" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import NodeResourceEditor from '@/components/NodeResourceEditor.vue'

const props = defineProps<{
  data: {
    label: string
    direction?: 'ltr' | 'rtl'
    inputs?: {
      resourceId: string
      unitId: string
      perCycle: number
    }[]
    resources?: {
      id: string
      name: string
      defaultUnitId: string
    }[]
  }
}>()

const data = props.data

const editableLabel = ref(data.label)
const currentDirection = ref(data.direction || 'ltr')

function updateLabel() {
  data.label = editableLabel.value
}

function toggleDirection() {
  currentDirection.value = currentDirection.value === 'ltr' ? 'rtl' : 'ltr'
  data.direction = currentDirection.value
}

const inputPosition = computed(() =>
  currentDirection.value === 'rtl' ? Position.Right : Position.Left
)
const outputPosition = computed(() =>
  currentDirection.value === 'rtl' ? Position.Left : Position.Right
)

function getResourceById(id: string) {
  return data.resources?.find(r => r.id === id) ?? {
    id: '',
    name: 'Unknown',
    defaultUnitId: ''
  }
}

function updateInput(index: number, newPerCycle: number) {
  if (data.inputs && data.inputs[index]) {
    data.inputs[index].perCycle = newPerCycle
  }
}
</script>

<style scoped>
.producer-node {
  background-color: #e6f4ea;
  border: 2px solid #a3d9a5;
  border-radius: 8px;
  padding: 1rem;
  width: 240px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', sans-serif;
}


.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  background-color: #f9f9f9;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.inputs-section h3 {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #555;
}

.direction-toggle {
  background: #eee;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 2px 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s ease;
}

.direction-toggle:hover {
  background: #ddd;
}

.producer-node:hover {
  border-color: #999;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

</style>
