<template>
  <div
    class="smart-node"
    :style="{ borderColor: isNodeValid ? data.statusColor || '#ccc' : '#f44336' }"
  >
    <div class="header">Smart</div>

    <input
      class="label-input"
      v-model="editableLabel"
      @blur="updateLabel"
      placeholder="Enter name"
    />

    <button class="direction-toggle" @click="toggleDirection">
      Flow: {{ direction }} {{ directionArrow }}
    </button>

    <div v-if="!isNodeValid" class="node-warning">
      ⚠️ This node has invalid inputs or outputs
    </div>

    <div class="timing-section">
      <h3>Timing</h3>
      <input
        v-model.number="data.cycleTime"
        type="number"
        placeholder="Cycle Time (s)"
        min="0"
        step="0.1"
      />
    </div>

    <div class="io-wrapper" :class="direction">
      <!-- Inputs Section -->
      <div class="inputs-section" v-if="data.inputs?.length >= 0">
        <h3>{{ direction === 'rtl' ? 'Inputs →' : '← Inputs' }}</h3>
        <div class="input-list">
          <div
            v-for="(input, index) in data.inputs"
            :key="index"
            class="input-row"
          >
            <label>Input {{ index + 1 }}</label>

            <Handle
              type="target"
              :position="inputPosition"
              :id="`input-${index}`"
              class="row-handle"
            />

            <select v-model="input.resourceId" @change="syncUnitForInput(input)">
              <option value="">Select resource</option>
              <option v-for="res in resourceOptions" :key="res.id" :value="res.id">
                {{ res.name }}
              </option>
            </select>

            <select
              v-model="input.unitId"
              :class="{ 'auto-filled': wasAutoFilled(input) }"
              :title="wasAutoFilled(input) ? 'Default unit applied from resource' : ''"
            >
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

            <button @click="removeInput(index)" class="remove-button" title="Remove input">✖️</button>

            <div v-if="!input.resourceId || !input.unitId || input.perCycle <= 0" class="validation-warning">
              ⚠️ Resource, unit, and perCycle required
            </div>
          </div>
        </div>
        <button @click="addInput" class="add-button">+ Add Input</button>
      </div>

      <!-- Outputs Section -->
      <div class="outputs-section" v-if="data.outputs?.length >= 0">
        <h3>{{ direction === 'rtl' ? '← Outputs' : 'Outputs →' }}</h3>
        <div class="output-list">
          <div
            v-for="(output, index) in data.outputs"
            :key="output.id || index"
            class="output-row"
          >
            <label>
              Output {{ index + 1 }}
              <span v-if="outputStatus[index] === 'valid'" class="status-icon">✅</span>
              <span v-else-if="outputStatus[index] === 'invalid'" class="status-icon">⚠️</span>
            </label>

            <Handle
              type="source"
              :position="outputPosition"
              :id="`output-${output.id || index}`"
              class="row-handle"
            />

            <select v-model="output.resourceId" @change="syncUnit(output)">
              <option value="">Select resource</option>
              <option v-for="res in resourceOptions" :key="res.id" :value="res.id">
                {{ res.name }}
              </option>
            </select>

            <select
              v-model="output.unitId"
              :class="{ 'auto-filled': wasAutoFilled(output) }"
              :title="wasAutoFilled(output) ? 'Default unit applied from resource' : ''"
            >
              <option value="">Select unit</option>
              <option v-for="unit in unitOptions" :key="unit.id" :value="unit.id">
                {{ unit.label }}
              </option>
            </select>

            <input
              type="number"
              v-model.number="output.perCycle"
              min="0"
              step="0.1"
              placeholder="perCycle"
            />

            <button @click="removeOutput(index)" class="remove-button" title="Remove output">✖️</button>

            <div v-if="!output.resourceId || output.perCycle <= 0" class="validation-warning">
              ⚠️ Resource and perCycle required
            </div>
          </div>
        </div>
        <button @click="addOutput" class="add-button">+ Add Output</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { Position } from '@vue-flow/core'
// import type { HandleType } from '@vue-flow/core'
import { useProjectStore } from '@/stores/project.store'

// Props
type SmartNodeData = {
  label: string
  direction?: 'ltr' | 'rtl'
  mode: 'producer' | 'consumer' | 'transformer'
  cycleTime: number
  inputs: { resourceId: string; unitId: string; perCycle: number }[]
  outputs: { id?: string; resourceId: string; unitId: string; perCycle: number }[]
  resources?: { id: string; name: string; defaultUnitId: string }[]
  statusColor?: string
}

const props = defineProps<{
  id: string
  data: Partial<SmartNodeData>
}>()

const nodeId = props.id
const projectStore = useProjectStore()

// Wrap data in reactive and ensure inputs/outputs are always arrays
const data = reactive<SmartNodeData>({
  label: props.data.label ?? '',
  direction: props.data.direction ?? 'ltr',
  mode: props.data.mode ?? 'producer',
  cycleTime: props.data.cycleTime ?? 0,
  inputs: props.data.inputs ?? [],
  outputs: props.data.outputs ?? [],
  resources: props.data.resources ?? [],
  statusColor: props.data.statusColor
})

// Label editing
const editableLabel = ref(data.label)
function updateLabel() {
  data.label = editableLabel.value
}
watch(() => data.label, newLabel => {
  editableLabel.value = newLabel
})

// Direction toggle
const direction = ref(data.direction ?? 'ltr')
function toggleDirection() {
  direction.value = direction.value === 'ltr' ? 'rtl' : 'ltr'
  data.direction = direction.value
}
const directionArrow = computed(() => (direction.value === 'ltr' ? '→' : '←'))

// Handle positions
const inputPosition = computed(() =>
  direction.value === 'rtl' ? Position.Right : Position.Left
)
const outputPosition = computed(() =>
  direction.value === 'rtl' ? Position.Left : Position.Right
)

// Resource and unit options
const resourceOptions = computed(() => data.resources ?? [])
const unitOptions = computed(() =>
  resourceOptions.value.map(res => ({
    id: res.defaultUnitId,
    label: res.defaultUnitId
  }))
)

// Auto-fill detection
function wasAutoFilled(entry: { unitId: string; resourceId: string }) {
  const res = resourceOptions.value.find(r => r.id === entry.resourceId)
  return res?.defaultUnitId === entry.unitId
}

// Sync unit when resource changes
function syncUnit(output: { resourceId: string; unitId: string }) {
  const res = resourceOptions.value.find(r => r.id === output.resourceId)
  if (res && !output.unitId) {
    output.unitId = res.defaultUnitId
  }
}
function syncUnitForInput(input: { resourceId: string; unitId: string }) {
  const res = resourceOptions.value.find(r => r.id === input.resourceId)
  if (res && !input.unitId) {
    input.unitId = res.defaultUnitId
  }
}

// Add/remove inputs
function addInput() {
  data.inputs.push({ resourceId: '', unitId: '', perCycle: 0 })
}
function removeInput(index: number) {
  data.inputs.splice(index, 1)
}

// Add/remove outputs
function addOutput() {
  data.outputs.push({
    id: crypto.randomUUID(),
    resourceId: '',
    unitId: '',
    perCycle: 0
  })
}
function removeOutput(index: number) {
  data.outputs.splice(index, 1)
}

// Output status tracking
const outputStatus = computed(() =>
  data.outputs.map(output =>
    output.resourceId && output.unitId && output.perCycle > 0
      ? 'valid'
      : 'invalid'
  )
)

// Node validation
const isNodeValid = computed(() => {
  const allInputsValid = data.inputs.every(
    i => i.resourceId && i.unitId && i.perCycle > 0
  )
  const allOutputsValid = data.outputs.every(
    o => o.resourceId && o.unitId && o.perCycle > 0
  )
  return allInputsValid && allOutputsValid
})

// 🔄 Sync changes to store
watch(
  () => ({
    label: data.label,
    cycleTime: data.cycleTime,
    direction: data.direction,
    inputs: data.inputs,
    outputs: data.outputs
  }),
  (newVal) => {
    const nodeIndex = projectStore.nodes.findIndex(n => n.id === nodeId)
    if (nodeIndex !== -1) {
      projectStore.nodes[nodeIndex].data = {
        ...projectStore.nodes[nodeIndex].data,
        ...newVal
      }
    }
  },
  { deep: true }
)
</script>








<style scoped>
.smart-node {
  background-color: #f0fdf4;
  border: 2px solid #a3d9a5;
  border-radius: 10px;
  padding: 1rem;
  width: 480px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', sans-serif;
  transition: border-color 0.3s ease;
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

.direction-toggle {
  margin-bottom: 12px;
  background-color: #e0e0e0;
  border: none;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.9rem;
}


.inputs-section,
.outputs-section {
  margin-top: 1rem;
}

.input-list,
.output-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.input-row,
.output-row {
  display: flex;
  position: relative;
  flex-direction: column;
  gap: 0.3rem;
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

.timing-section {
  margin-top: 1rem;
  background-color: #fffbe6;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ffe58f;
}

.timing-section {
  margin-top: 1rem;
  background-color: #fffbe6;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #ffe58f;
}

.timing-section h3 {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #555;
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

.inputs-section,
.outputs-section {
  flex: 1;
  background-color: #f9f9f9;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.input-row,
.output-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-icon {
  margin-left: 0.5rem;
  font-size: 1rem;
}

select.auto-filled {
  background-color: #e8f5e9;
  border-color: #81c784;
}

.row-handle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: -12px; /* or right: -12px for RTL */
  width: 12px;
  height: 12px;
  background-color: #4caf50;
  border: 2px solid white;
  border-radius: 50%;
  z-index: 10;
}

.remove-button {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #f44336;
  margin-left: auto;
  padding: 0.2rem 0.4rem;
  align-self: center;
  transition: color 0.2s ease;
}

.remove-button:hover {
  color: #d32f2f;
}


</style>
