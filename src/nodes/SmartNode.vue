<template>
  <div
    class="smart-node w-full max-w-3xl mx-auto p-4 border rounded-md shadow-sm bg-white"
    :style="{ borderColor: isNodeValid ? '#ccc' : '#f44336' }"
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
      <!-- Inputs -->
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
            </div>

            <select v-model="input.id" class="px-2 py-1 border rounded text-sm">
              <option value="">Select resource</option>
              <!-- Placeholder options -->
              <option value="water">Water</option>
              <option value="energy">Energy</option>
              <option value="fuel">Fuel</option>
              <option value="oxygen">Oxygen</option>

            </select>

            <select v-model="input.unitId" class="px-2 py-1 border rounded text-sm">
              <option value="">Select unit</option>
              <!-- Placeholder options -->
              <option value="liter">Liter</option>
              <option value="kWh">kWh</option>
              <option value="gallon">Gallon</option>
              <option value="mole">Mole</option>

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
        </div>
        <button @click="addInput" class="add-button mt-4 text-sm text-blue-600">+ Add Input</button>
      </div>

      <!-- Outputs -->
      <div class="outputs-section">
        <h3 class="text-sm font-semibold mb-2">{{ direction === 'rtl' ? '← Outputs' : 'Outputs →' }}</h3>
        <div class="output-list flex flex-col gap-4">
          <div
            v-for="(output, index) in data.outputs"
            :key="index"
            class="output-row p-4 border rounded-md bg-gray-50 relative"
          >
            <Handle
              type="source"
              :id="`output-${index}`"
              :position="Position.Right"
              class="absolute top-2 right-[-6px] w-[10px] h-[10px] bg-gray-600 rounded-full"
            />

            <div class="output-label flex items-center justify-between mb-1">
              <label class="text-sm font-semibold">Output {{ index + 1 }}</label>
            </div>

            <select v-model="output.id" class="px-2 py-1 border rounded text-sm">
              <option value="">Select resource</option>
              <option value="res1">Resource 1</option>
              <option value="res2">Resource 2</option>
            </select>

            <select v-model="output.unitId" class="px-2 py-1 border rounded text-sm">
              <option value="">Select unit</option>
              <option value="unit1">Unit 1</option>
              <option value="unit2">Unit 2</option>
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
        </div>
        <button @click="addOutput" class="add-button mt-4 text-sm text-blue-600">+ Add Output</button>
      </div>
    </div>
  </div>
</template>


















<script setup lang="ts">
import { computed } from 'vue'
import { Position, Handle } from '@vue-flow/core'
import type { Resource } from '@/types/resource'


const props = defineProps<{ data: any; project: { resources?: Resource[] } }>()

const resourceOptions = computed(() =>
  (props.project.resources ?? []).map((r) => ({
    id: r.id,
    name: r.name,
  }))
)

const direction = computed(() => props.data?.direction ?? 'ltr')
const directionArrow = computed(() => direction.value === 'rtl' ? '→' : '←')
const isNodeValid = computed(() => true)

const editableLabel = computed({
  get: () => props.data?.label ?? '',
  set: (val) => props.data.label = val
})


function updateLabel() {
  // optional label sync logic
}

function toggleDirection() {
  props.data.direction = props.data.direction === 'rtl' ? 'ltr' : 'rtl'
}

function addInput() {
  props.data.inputs.push({
    id: '',
    unitId: '',
    perCycle: 1
  })
}

function addOutput() {
  props.data.outputs.push({
    id: '',
    unitId: '',
    perCycle: 1
  })
}
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
