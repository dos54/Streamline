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
      <div class="inputs-section" v-if="Array.isArray(data.inputs)">
        <h3>{{ direction === 'rtl' ? 'Inputs →' : '← Inputs' }}</h3>
        <div class="input-list">
          <div
            v-for="(input, index) in data.inputs"
            :key="index"
            class="input-row"
            style="position: relative"
          >
            <label>Input {{ index + 1 }}</label>

            <Handle
              type="target"
              :position="inputPosition"
              :id="`input-${index}`"
              class="row-handle"
            />

            <select v-model="input.resourceId">
              <option value="">Select resource</option>
              <option v-for="res in resourceOptions" :key="res.id" :value="res.id">
                {{ res.name }}
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

      <div class="outputs-section" v-if="Array.isArray(data.outputs)">
        <h3>{{ direction === 'rtl' ? '← Outputs' : 'Outputs →' }}</h3>
        <div class="output-list">
          <div
            v-for="(output, index) in data.outputs"
            :key="output.id"
            class="output-row"
            style="position: relative"
          >
            <label>
              Output {{ index + 1 }}
              <span v-if="outputStatus[index] === 'valid'" class="status-icon">✅</span>
              <span v-else-if="outputStatus[index] === 'invalid'" class="status-icon">⚠️</span>
            </label>

            <Handle
              type="source"
              :position="outputPosition"
              :id="`output-${output.id}`"
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
import { ref, computed, watchEffect } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { useProjectStore } from '../stores/project.store'
import type { Unit } from '@/types/project'

const project = useProjectStore()

const props = defineProps<{
  data: {
    label: string
    direction?: 'ltr' | 'rtl'
    mode: 'producer' | 'consumer' | 'transformer'
    cycleTime: number
    inputs: {
      resourceId: string
      perCycle: number
    }[]
    outputs: {
      id: string
      resourceId: string
      unitId: string
      perCycle: number
    }[]
    resources?: {
      id: string
      name: string
      defaultUnitId: string
    }[]
    statusColor?: string
  }
}>()


const data = props.data

const editableLabel = ref(data.label)
function updateLabel() {
  data.label = editableLabel.value
}

// 🔁 Direction toggle logic
const direction = ref(data.direction ?? 'ltr')
const directionArrow = computed(() =>
  direction.value === 'rtl' ? '←' : '→'
)
const inputPosition = computed(() =>
  direction.value === 'rtl' ? Position.Right : Position.Left
)
const outputPosition = computed(() =>
  direction.value === 'rtl' ? Position.Left : Position.Right
)
function toggleDirection() {
  direction.value = direction.value === 'ltr' ? 'rtl' : 'ltr'
  data.direction = direction.value
}

// ➕ Add input/output
function addInput() {
  data.inputs.push({
    resourceId: '',
    perCycle: 0,
  })
}

function createOutput() {
  return {
    id: crypto.randomUUID(),
    resourceId: '',
    unitId: '',
    perCycle: 0,
  }
}

function addOutput() {
  data.outputs.push(createOutput())
}

// ✅ Validation helpers
function isValidResource(r: { resourceId: string; perCycle: number }) {
  return r.resourceId !== '' && r.perCycle > 0
}

const isNodeValid = computed(() => {
  const inputsValid = data.inputs.every(isValidResource)
  const outputsValid = data.outputs.every(isValidResource)
  return inputsValid && outputsValid
})

// ⚠️ Simulated consumer demand (replace with real graph data later)
const connectedConsumers = ref([
  { resourceId: 'power', required: 5 },
  { resourceId: 'steel', required: 10 },
])

function validateOutput(output: typeof data.outputs[number]) {
  if (!output.resourceId || output.perCycle <= 0) return 'invalid'

  const matchingConsumers = connectedConsumers.value.filter(
    (c) => c.resourceId === output.resourceId
  )

  const totalRequired = matchingConsumers.reduce((sum, c) => sum + c.required, 0)
  return output.perCycle >= totalRequired ? 'valid' : 'invalid'
}

const outputStatus = computed(() =>
  data.outputs.map(validateOutput)
)

// ✨ Auto-fill unitId when resource is selected
function syncUnit(output: typeof data.outputs[number]) {
  if (!output.resourceId) return

  const resource = project.resources?.find((r) => r.id === output.resourceId)
  if (resource && !output.unitId) {
    output.unitId = resource.defaultUnitId ?? ''
  }
}

function wasAutoFilled(output: typeof data.outputs[number]) {
  const resource = project.resources?.find((r) => r.id === output.resourceId)
  return resource?.defaultUnitId === output.unitId
}


// 📦 Resource and unit dropdowns
const resourceOptions = computed(() =>
  (project.resources ?? []).map((r) => ({
    id: r.id,
    name: r.name,
  }))
)

const unitOptions = computed(() =>
  ((project.units ?? []) as Unit[]).map((u) => ({
    id: u.id,
    label: `${u.name} (${u.symbol})`,
  }))
)

watchEffect(() => {
  console.log('Project loaded?', !!project.current)
  console.log('Resources:', project.resources ?? [])
  console.log('Units:', project.units ?? [])
})
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

.direction-toggle:hover {
  background: #b2dfdb;
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
  flex-direction: column;
  gap: 0.3rem;
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
  width: 10px;
  height: 10px;
  background-color: #4caf50;
  border: 2px solid white;
  border-radius: 50%;
  z-index: 10;
}


</style>
