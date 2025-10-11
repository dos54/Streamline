<template>
  <div
    class="consumer-node"
    :style="{ borderColor: isNodeValid ? data.statusColor || '#ccc' : '#f44336' }"
  >
    <div class="header">Consumer</div>

    <input
      class="label-input"
      v-model="editableLabel"
      @blur="updateLabel"
      placeholder="Enter name"
    />

    <button class="direction-toggle" @click="toggleDirection">
      Flow: {{ currentDirection }} {{ directionArrow }}
    </button>

    <div class="status-section" v-if="data?.statusMessages?.length">
      <h3>Status</h3>
      <ul>
        <li v-for="(msg, index) in data.statusMessages" :key="index">
          {{ msg }}
        </li>
      </ul>
    </div>

    <div v-if="!isNodeValid" class="node-warning">⚠️ This node has invalid inputs</div>

    <div class="io-wrapper" :class="currentDirection">
      <div class="inputs-section">
        <h3>{{ currentDirection === 'rtl' ? 'Inputs →' : '← Inputs' }}</h3>
        <div class="input-list">
          <div v-for="(input, index) in data?.inputs" :key="index" class="input-row">
            <label>Input {{ index + 1 }}</label>

            <select v-model="input.resourceId" @change="syncUnit(input)">
              <option value="">Select resource</option>
              <option v-for="res in resourceOptions" :key="res.id" :value="res.id">
                {{ res.name }}
              </option>
            </select>

            <select v-model="input.unitId" :class="{ 'auto-filled': wasAutoFilled(input) }">
              <option value="">Select unit</option>
              <option v-for="unit in unitOptions" :key="unit.id" :value="unit.id">
                {{ unit.label }}
              </option>
            </select>

            <input
              type="number"
              v-model.number="input.perCycle"
              min="0"
              step="0.1"
              placeholder="perCycle"
            />

            <div v-if="!input.resourceId || input.perCycle <= 0" class="validation-warning">
              ⚠️ Resource and perCycle required
            </div>
          </div>
        </div>
        <button @click="addInput" class="add-button">+ Add Input</button>
      </div>
    </div>

    <Handle type="target" :position="inputPosition" />
    <Handle type="source" :position="outputPosition" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { useProjectStore } from '../stores/project.store'
import type { Unit } from '@/types/project'

const project = useProjectStore()

const props = defineProps<{
  data: {
    label: string
    direction?: 'ltr' | 'rtl'
    inputs: {
      resourceId: string
      unitId: string
      perCycle: number
    }[]
    statusMessages?: string[]
    statusColor?: string
  }
}>()

const data = props.data

const editableLabel = ref(data?.label)
function updateLabel() {
  data.label = editableLabel.value
}

function addInput() {
  data.inputs.push({
    resourceId: '',
    unitId: '',
    perCycle: 0,
  })
}

//  Validation logic
function isValidResource(r: { resourceId: string; perCycle: number }) {
  return r.resourceId !== '' && r.perCycle > 0
}

const isNodeValid = computed(() => data?.inputs?.every(isValidResource))

//  Direction toggle logic
const currentDirection = ref(data?.direction || 'ltr')
const directionArrow = computed(() => (currentDirection.value === 'rtl' ? '←' : '→'))
function toggleDirection() {
  currentDirection.value = currentDirection.value === 'ltr' ? 'rtl' : 'ltr'
  data.direction = currentDirection.value
}

const inputPosition = computed(() =>
  currentDirection.value === 'rtl' ? Position.Right : Position.Left,
)
const outputPosition = computed(() =>
  currentDirection.value === 'rtl' ? Position.Left : Position.Right,
)

// ✨ Auto-fill unitId when resource is selected
function syncUnit(input: (typeof data.inputs)[number]) {
  if (!input.resourceId) return

  const resource = project.resources?.find((r) => r.id === input.resourceId)
  if (resource && !input.unitId) {
    input.unitId = resource.defaultUnitId as string // There is a type error here. "As string" is a band-aid fix that we need to replace later.
  }
}

// 🧠 Detect auto-filled unit for styling
function wasAutoFilled(input: (typeof data.inputs)[number]) {
  const resource = project.resources?.find((r) => r.id === input.resourceId)
  return resource?.defaultUnitId === input.unitId
}

// 📦 Resource and unit dropdowns
const resourceOptions = computed(() =>
  (project.resources ?? []).map((r) => ({
    id: r.id,
    name: r.name,
  })),
)

const unitOptions = computed(() =>
  ((project.units ?? []) as Unit[]).map((u) => ({
    id: u.id,
    label: `${u.name} (${u.symbol})`,
  })),
)
</script>

<style scoped>
.consumer-node {
  background-color: #fff;
  border: 2px solid #ccc;
  border-radius: 10px;
  padding: 1rem;
  width: 280px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', sans-serif;
  transition: border-color 0.3s ease;
}

.consumer-node[style*='#4caf50'] {
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.4);
}

.header {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #2e7d32;
  text-align: center;
}

.label-input {
  width: 100%;
  padding: 6px 10px;
  font-size: 0.95rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-bottom: 0.75rem;
}

.status-section {
  margin-bottom: 1rem;
}

.inputs-section {
  margin-top: 1rem;
  background-color: #fef7f0;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #f5d9b0;
}

.input-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.input-row {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.input-row select,
.input-row input {
  padding: 0.3rem;
  font-size: 0.85rem;
}

.add-button {
  margin-top: 0.5rem;
  background-color: #d0eaff;
  border: none;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.add-button:hover {
  background-color: #b0d4f0;
}

.validation-warning {
  font-size: 0.75rem;
  color: #d32f2f;
}

.node-warning {
  background-color: #fff3cd;
  color: #856404;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.io-wrapper {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.io-wrapper.ltr {
  flex-direction: row;
}

.io-wrapper.rtl {
  flex-direction: row-reverse;
}

.inputs-section {
  flex: 1;
  background-color: #fef7f0;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #f5d9b0;
}

.input-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.input-row {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.input-row select,
.input-row input {
  padding: 0.3rem;
  font-size: 0.85rem;
}

.node-warning {
  background-color: #fff3cd;
  color: #856404;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.direction-toggle {
  display: block;
  margin: 0 auto 1rem;
  background: #e0f2f1;
  border: 1px solid #80cbc4;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 6px;
  color: #00695c;
  transition: background 0.2s ease;
}

.direction-toggle:hover {
  background: #b2dfdb;
}
</style>
