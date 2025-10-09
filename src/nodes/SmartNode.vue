<template>
  <div
    class="smart-node w-full max-w-3xl mx-auto p-4 border rounded-md shadow-sm bg-white"
    :style="{ borderColor: isNodeValid ? data.statusColor || '#ccc' : '#f44336' }"
  >
    <div class="header text-lg font-bold mb-2">Smart</div>

    <input
      class="label-input w-full mb-4 px-3 py-2 border rounded text-sm"
      v-model="editableLabel"
      @blur="updateLabel"
      placeholder="Enter name"
    />

    <button class="direction-toggle mb-4 text-sm text-blue-600" @click="toggleDirection">
      Flow: {{ direction }} {{ directionArrow }}
    </button>

    <div v-if="!isNodeValid" class="node-warning text-red-600 text-sm mb-4">
      ⚠️ This node has invalid inputs or outputs
    </div>

    <div class="timing-section mb-6">
      <h3 class="text-sm font-semibold mb-1">Timing</h3>
      <input
        v-model.number="data.cycleTime"
        type="number"
        placeholder="Cycle Time (s)"
        min="0"
        step="0.1"
        class="w-full px-3 py-2 border rounded text-sm"
      />
    </div>

    <div class="io-wrapper flex flex-col gap-6" :class="direction">
      <!-- Inputs Section -->
      <div class="inputs-section">
        <h3 class="text-sm font-semibold mb-2">{{ direction === 'rtl' ? 'Inputs →' : '← Inputs' }}</h3>
        <div class="input-list flex flex-col gap-4">
          <div
            v-for="(input, index) in data.inputs"
            :key="index"
            class="input-block p-4 border rounded-md bg-gray-50 relative"
          >
            <Handle
              type="target"
              :id="`input-${index}`"
              :position="Position.Left"
              class="absolute top-2 left-[-6px] w-[10px] h-[10px] bg-gray-600 rounded-full"
            />

            <div class="input-label flex items-center justify-between mb-1">
              <label class="text-sm font-semibold">Input {{ index + 1 }}</label>
              <span
                class="status-icon text-lg"
                :class="balanceMap.get(input.resourceId)?.status"
                :title="balanceMap.get(input.resourceId)?.message || 'No status found'"
              >
                {{ statusIcon(balanceMap.get(input.resourceId)?.status || 'missing') }}
              </span>
            </div>

            <div class="debug-line text-xs text-gray-500 mb-2">
              Debug: input.resourceId = {{ input.resourceId }},
              balance status = {{ balanceMap.get(input.resourceId)?.status || 'none' }}
            </div>

            <div class="input-fields flex flex-wrap gap-2 mt-2">
              <select v-model="input.resourceId" @change="syncUnitForInput(input)" class="px-2 py-1 border rounded text-sm">
                <option value="">Select resource</option>
                <option v-for="res in resourceOptions" :key="res.id" :value="res.id">
                  {{ res.name }}
                </option>
              </select>

              <select
                v-model="input.unitId"
                :class="{ 'auto-filled': wasAutoFilled(input) }"
                :title="wasAutoFilled(input) ? 'Default unit applied from resource' : ''"
                class="px-2 py-1 border rounded text-sm"
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
                class="px-2 py-1 border rounded text-sm w-24"
              />
            </div>

            <button @click="removeInput(index)" class="remove-button text-red-600 text-sm mt-2">✖️ Remove</button>

            <div v-if="!input.resourceId || !input.unitId || input.perCycle <= 0" class="validation-warning text-xs text-red-500 mt-1">
              ⚠️ Resource, unit, and perCycle required
            </div>
          </div>
        </div>
        <button @click="addInput" class="add-button mt-4 text-sm text-blue-600">+ Add Input</button>
      </div>

      <!-- Outputs Section -->
      <div class="outputs-section">
        <h3 class="text-sm font-semibold mb-2">{{ direction === 'rtl' ? '← Outputs' : 'Outputs →' }}</h3>
        <div class="output-list flex flex-col gap-4">
          <div
            v-for="(output, index) in data.outputs"
            :key="output.id || index"
            class="output-row p-4 border rounded-md bg-gray-50 relative"
          >
            <Handle
              type="source"
              :id="`output-${output.id || index}`"
              :position="Position.Right"
              class="absolute top-2 right-[-6px] w-[10px] h-[10px] bg-gray-600 rounded-full"
            />

            <div class="output-label flex items-center justify-between mb-1">
              <label class="text-sm font-semibold">Output {{ index + 1 }}</label>
              <span
                class="status-icon text-lg"
                :class="balanceMap.get(output.resourceId)?.status"
                :title="balanceMap.get(output.resourceId)?.message || 'No status found'"
              >
                {{ statusIcon(balanceMap.get(output.resourceId)?.status || 'missing') }}
              </span>
            </div>

            <div class="input-fields flex flex-wrap gap-2 mt-2">
              <select v-model="output.resourceId" @change="syncUnit(output)" class="px-2 py-1 border rounded text-sm">
                <option value="">Select resource</option>
                <option v-for="res in resourceOptions" :key="res.id" :value="res.id">
                  {{ res.name }}
                </option>
              </select>

              <select
                v-model="output.unitId"
                :class="{ 'auto-filled': wasAutoFilled(output) }"
                :title="wasAutoFilled(output) ? 'Default unit applied from resource' : ''"
                class="px-2 py-1 border rounded text-sm"
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
                class="px-2 py-1 border rounded text-sm w-24"
              />
            </div>

            <button @click="removeOutput(index)" class="remove-button text-red-600 text-sm mt-2">✖️ Remove</button>

            <div v-if="!output.resourceId || output.perCycle <= 0" class="validation-warning text-xs text-red-500 mt-1">
              ⚠️ Resource and perCycle required
            </div>
          </div>
        </div>
        <button @click="addOutput" class="add-button mt-4 text-sm text-blue-600">+ Add Output</button>
      </div>
    </div>
  </div>
</template>
















<script setup lang="ts">
import { ref, computed, watch, reactive, watchEffect, onMounted } from 'vue'
import type { HandleType } from '@vue-flow/core'
import { useProjectStore } from '@/stores/project.store'
import { validateResourceFlow } from '@/utils/flowValidation'
import { Handle, Position } from '@vue-flow/core'
import { toRaw } from 'vue'

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

// Inject test edge on mount
onMounted(() => {
  projectStore.injectTestEdge('water')
})

// 🔍 Flow validation results
const flowResults = computed(() =>
  validateResourceFlow(projectStore.nodes, projectStore.edges)
)

//Map of resourceId → badge status + message
const balanceMap = computed(() => {
  const map = new Map<string, { status: string; message: string }>()
  for (const result of flowResults.value) {
    if (result.target === props.id) {
      map.set(result.resourceId, {
        status: result.balanceStatus,
        message: result.message
      })
    }
  }
  return map
})

// Debug logs
watchEffect(() => {
  console.log('🔍 flowResults:', flowResults.value)
  console.log('🧠 balanceMap contents:', Array.from(balanceMap.value.entries()))
  console.log('🧩 Edges:', toRaw(projectStore.edges))
  for (const node of projectStore.nodes) {
    console.log('🧩 Validating node:', node.id)
  }
})

// Badge icon helper
function statusIcon(status?: string): string {
  return {
    exact: '✅',
    over: '🔄',
    under: '⚠️',
    missing: '❌'
  }[status ?? 'missing'] ?? '❌'
}

// Icon test
console.log('🔍 Icon test:', statusIcon('exact'))

// Reactive node data
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

// Sync changes to store (ensures flowResults updates)
watch(
  () => ({
    label: data.label,
    cycleTime: data.cycleTime,
    direction: data.direction,
    inputs: data.inputs.map(i => ({ ...i })),
    outputs: data.outputs.map(o => ({ ...o }))
  }),
  (newVal) => {
    const nodeIndex = projectStore.nodes.findIndex(n => n.id === nodeId)
    if (nodeIndex !== -1) {
      projectStore.nodes[nodeIndex].data = {
        ...projectStore.nodes[nodeIndex].data,
        ...toRaw(newVal)
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
  max-width: 100%;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', sans-serif;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
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
  background-color: #e0e0e0;
  border: none;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  border-radius: 6px;
  color: #00695c;
  transition: background 0.2s ease;
}

.inputs-section,
.outputs-section {
  margin-top: 1rem;
  flex: 1;
  background-color: #f9f9f9;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.input-list,
.output-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-row,
.output-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  position: relative;
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
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
}

.io-wrapper.ltr {
  flex-direction: column;
}

.io-wrapper.rtl {
  flex-direction: column;
}

.status-icon {
  font-size: 1.2em;
  margin-left: 0.5em;
  display: inline-block;
  vertical-align: middle;
}

.status-icon:hover {
  transform: scale(1.2);
}

.status-icon.exact   { color: #2e7d32; }  /* green */
.status-icon.over    { color: #0277bd; }  /* blue */
.status-icon.under   { color: #f9a825; }  /* amber */
.status-icon.missing { color: #c62828; }  /* red */

select.auto-filled {
  background-color: #e8f5e9;
  border-color: #81c784;
}

.row-handle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: -12px;
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

.input-block,
.output-row {
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 6px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
}

.input-label,
.output-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.input-fields {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
  width: 100%;
}
</style>
