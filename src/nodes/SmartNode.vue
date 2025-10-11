<template>
  <div class="smart-node w-full max-w-3xl mx-auto p-4 border rounded-md shadow-sm bg-white"
    :style="{ borderColor: isNodeValid ? '#ccc' : '#f44336' }">

    <div class="header text-lg font-bold mb-2">
      {{ props.data.label ?? 'Smart' }}
    </div>



    <div v-if="props.data.statusTypes?.length" class="status-icons flex gap-1 mb-2">
      <span v-for="type in props.data.statusTypes" :key="type" :class="['status-icon', type.split(':')[0]]"
        :title="formatStatusTooltip(type)">
        {{ getStatusIcon(type) }}
      </span>
    </div>





    <!-- 🔍 Debug StatusTypes -->
    <div class="text-xs text-gray-500 mb-2">
      Debug: {{ props.data.statusTypes }}
    </div>



    <div v-if="props.statusTypes?.length" class="status-icons flex gap-1 mb-4">
      <span v-for="type in props.statusTypes" :key="type" :class="['status-icon', type.split(':')[0]]"
        :title="formatStatusTooltip(type)">
        {{ getStatusIcon(type) }}
      </span>
    </div>


    <!-- ✅ Test Dropdown Block -->
    <div class="debug-dropdown mb-4">
      <label class="text-sm font-medium block mb-1">Test Resource Dropdown</label>

      <div class="text-xs text-gray-500 mb-2">
        Resource count: {{ resourceOptions.length }}
      </div>


      <div v-if="resourceOptions && resourceOptions.length > 0">
        <select class="border rounded px-2 py-1 text-sm w-full">
          <option value="">Select resource</option>
          <option v-for="res in resourceOptions" :key="res.id" :value="res.id">
            {{ res.name }}
          </option>
        </select>
      </div>


      <div v-else class="text-sm text-gray-500 italic">
        ⚠️ No resources available for this node
      </div>
    </div>

    <input class="label-input w-full mb-4 px-3 py-2 border rounded text-sm" v-model="editableLabel" @blur="updateLabel"
      placeholder="Enter name" />

    <button class="direction-toggle mb-4 text-sm text-blue-600" @click="toggleDirection">
      Flow: {{ direction }} {{ directionArrow }}
    </button>

    <div v-if="!isNodeValid" class="node-warning text-red-600 text-sm mb-4">
      ⚠️ This node has invalid inputs or outputs
    </div>

    <div class="timing-section mb-6">
      <h3 class="text-sm font-semibold mb-1">Timing</h3>
      <input v-model.number="props.data.cycleTime" type="number" placeholder="Cycle Time (s)" min="0" step="0.1"
        class="w-full px-3 py-2 border rounded text-sm" />
    </div>

    <div class="io-wrapper flex flex-col gap-6" :class="direction">
      <!-- Inputs -->
      <div class="inputs-section">
        <h3 class="text-sm font-semibold mb-2">{{ direction === 'rtl' ? 'Inputs →' : '← Inputs' }}</h3>
        <div class="input-list flex flex-col gap-4">
          <div v-for="(input, index) in props.data.inputs" :key="index"
            class="input-row p-4 border rounded-md bg-gray-50 relative">
            <div class="flex justify-between items-center mb-1">
              <label class="text-sm font-semibold">Input {{ index + 1 }}</label>
              <button @click="removeInput(index)" class="text-xs text-red-600 hover:underline">Remove</button>
            </div>

            <Handle type="target" :id="`input-${index}`" :position="Position.Left"
              class="absolute top-2 left-[-6px] w-[10px] h-[10px] bg-gray-600 rounded-full" />

            <select v-model="input.resourceId" @change="syncUnit(input)"
              class="px-2 py-1 border rounded text-sm w-full">
              <option value="">Select resource</option>
              <option v-for="res in resourceOptions" :key="res.id" :value="res.id">
                {{ res.name }}
              </option>
            </select>

            <div class="text-xs text-gray-500 mt-1">
              Bound resourceId: {{ input.resourceId }}
            </div>

            <select v-model="input.unitId" :class="{ 'auto-filled': wasAutoFilled(input) }"
              class="px-2 py-1 border rounded text-sm">
              <option value="">Select unit</option>
              <option value="kg">kg</option>
              <option value="kWh">kWh</option>
              <option value="liters">liters</option>
            </select>

            <input type="number" v-model.number="input.perCycle" min="0" step="0.1" placeholder="perCycle"
              class="px-2 py-1 border rounded text-sm w-24" />

            <div v-if="!input.resourceId || (input.perCycle ?? 0) <= 0" class="text-xs text-red-600 mt-1">

              ⚠️ Resource and perCycle required
            </div>
          </div>
        </div>
        <button @click="addInput" class="add-button mt-4 text-sm text-blue-600">+ Add Input</button>
      </div>

      <!-- Outputs -->
      <div class="outputs-section">
        <h3 class="text-sm font-semibold mb-2">{{ direction === 'rtl' ? '← Outputs' : 'Outputs →' }}</h3>
        <div class="output-list flex flex-col gap-4">
          <div v-for="(output, index) in props.data.outputs" :key="index"
            class="output-row p-4 border rounded-md bg-gray-50 relative">
            <div class="flex justify-between items-center mb-1">
              <label class="text-sm font-semibold">Output {{ index + 1 }}</label>
              <button @click="removeOutput(index)" class="text-xs text-red-600 hover:underline">Remove</button>
            </div>

            <Handle type="source" :id="`output-${index}`" :position="Position.Right"
              class="absolute top-2 right-[-6px] w-[10px] h-[10px] bg-gray-600 rounded-full" />

            <select v-model="output.resourceId" @change="syncUnit(output)" class="px-2 py-1 border rounded text-sm">
              <option value="">Select resource</option>
              <option v-for="res in resourceOptions" :key="res.id" :value="res.id">
                {{ res.name }}
              </option>
            </select>

            <select v-model="output.unitId" :class="{ 'auto-filled': wasAutoFilled(output) }"
              class="px-2 py-1 border rounded text-sm">
              <option value="">Select unit</option>
              <option value="kg">kg</option>
              <option value="kWh">kWh</option>
              <option value="liters">liters</option>
            </select>

            <input type="number" v-model.number="output.perCycle" min="0" step="0.1" placeholder="perCycle"
              class="px-2 py-1 border rounded text-sm w-24" />

            <div v-if="!output.resourceId || (output.perCycle ?? 0) <= 0" class="text-xs text-red-600 mt-1">
              ⚠️ Missing or invalid output
            </div>
          </div>
        </div>
      </div>
      <button @click="addOutput" class="add-button mt-4 text-sm text-blue-600">+ Add Output</button>
    </div>
  </div>
</template>























<script setup lang="ts">
import { computed, ref, watch, watchEffect, onMounted } from 'vue'
import { Position, Handle } from '@vue-flow/core'
import type { NodeIO, GraphNode } from '@/schemas/graphNode.schema'
import type { Resource } from '@/schemas/graphNode.schema'

function syncUnit(entry: NodeIO) {
  // ✅ Find the matching resource by ID
  const match = resourceOptions.value.find((r: Resource) => r.id === entry.resourceId)

  if (match?.defaultUnitId) {
    entry.unitId = match.defaultUnitId
    console.log(`🔄 Autofilled unitId for ${entry.resourceId}:`, entry.unitId)
  } else {
    console.warn(`⚠️ No matching resource found for ${entry.resourceId}`)
  }
}





const props = defineProps<{
  id: string
  type: string
  data: GraphNode['data'] & {
    inputs?: NodeIO[]
    outputs?: NodeIO[]
    statusTypes?: string[]
    label?: string
    direction?: string
    cycleTime?: number
    name?: string
    resources?: Resource[]
  }
  project: {
    resources?: Resource[]
  }
  statusTypes?: string[]
}>()

function getStatusIcon(type: string): string {
  const prefix = type.split(':')[0]
  return prefix === 'exact' ? '✅'
    : prefix === 'over' ? '🔼'
      : prefix === 'under' ? '⚠️'
        : prefix === 'missing' ? '❌'
          : '❓'
}

function formatStatusTooltip(type: string): string {
  const [prefix, resource] = type.split(':')
  if (!resource) return 'Unknown status'

  return prefix === 'exact' ? `✅ ${resource} is balanced`
    : prefix === 'over' ? `🔼 ${resource} is oversupplied`
      : prefix === 'under' ? `⚠️ ${resource} is undersupplied`
        : prefix === 'missing' ? `❌ ${resource} is missing`
          : `❓ Unknown status for ${resource}`
}


onMounted(() => {
  const hasError = props.data?.statusTypes?.includes('error') ?? false
  console.log('Mounted SmartNode:', props.data?.statusTypes)
  console.log('❗ Has error status:', hasError)
})


watchEffect(() => {
  console.log('Reactive statusTypes:', props.data.statusTypes)
})

const nodeType = computed(() => {
  const hasInputs = props.data.inputs?.length ?? 0
  const hasOutputs = props.data.outputs?.length ?? 0

  if (hasInputs && !hasOutputs) return 'Consumer'
  if (!hasInputs && hasOutputs) return 'Producer'
  if (hasInputs && hasOutputs) return 'Smart'
  return 'Unconfigured'
})



console.log('✅ SmartNode resources:', props.data.resources);



const resourceOptions = computed(() => {
  const local = (props.data as any).resources ?? []
  const fallback = props.project?.resources ?? []
  const raw = local.length ? local : fallback

  return raw.map((r: Resource) => ({
    id: r.id,
    name: r.name,
    defaultUnitId: r.defaultUnitId ?? ''
  }))
})





watch(resourceOptions, (val) => {
  console.log('🧪 resourceOptions changed:', val)
})
console.log('🧪 Initial resourceOptions:', resourceOptions.value)

// Defensive array setup
onMounted(() => {
  if (!props.data.inputs) props.data.inputs = []
  else {
    props.data.inputs = props.data.inputs.map((input: NodeIO) => ({
      resourceId: input.resourceId ?? '',
      unitId: input.unitId ?? '',
      perCycle: input.perCycle ?? 1
    }))
  }

  if (!props.data.outputs) {
    props.data.outputs = []
  } else {
    props.data.outputs = props.data.outputs.map((output: NodeIO) => ({
      resourceId: output.resourceId ?? '',
      unitId: output.unitId ?? '',
      perCycle: output.perCycle ?? 1,
      id: output.id ?? `output-${Math.random().toString(36).slice(2)}`
    }))
  }

})

// Direction logic
const direction = computed(() => props.data?.direction ?? 'ltr')
const directionArrow = computed(() => direction.value === 'rtl' ? '→' : '←')
const isNodeValid = computed(() => true)

// Label binding
const editableLabel = computed({
  get: () => props.data?.label ?? props.data?.name ?? 'Smart',
  set: (val: string) => props.data.label = val
})

// ✅ Label update handler
function updateLabel() {
  console.log('📝 Label updated:', editableLabel.value)
  // Optional: emit or sync with store
}

// ✅ Direction toggle handler
function toggleDirection() {
  props.data.direction = props.data.direction === 'ltr' ? 'rtl' : 'ltr'
  console.log('🔁 Direction toggled to:', props.data.direction)
}



// Add/remove logic with reactive-safe mutation
function addInput() {
  const newInput: NodeIO = { resourceId: '', unitId: '', perCycle: 1 }
  if (!props.data.inputs) props.data.inputs = []
  props.data.inputs = [...props.data.inputs, newInput]
}

function addOutput() {
  const newOutput: NodeIO = { resourceId: '', unitId: '', perCycle: 1 }
  if (!props.data.outputs) props.data.outputs = []
  props.data.outputs = [...props.data.outputs, newOutput]
}

function removeInput(index: number) {
  if (!props.data.inputs) return
  props.data.inputs = props.data.inputs.filter((_: NodeIO, i: number) => i !== index)
}

function removeOutput(index: number) {
  if (!props.data.outputs) return
  props.data.outputs = props.data.outputs.filter((_: NodeIO, i: number) => i !== index)
}





function wasAutoFilled(entry: NodeIO) {
  const match = resourceOptions.value.find((r: Resource) => r.id === entry.resourceId)

  return match?.defaultUnitId === entry.unitId
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

.status-icon.exact {
  color: #2e7d32;
}

/* green */
.status-icon.over {
  color: #0277bd;
}

/* blue */
.status-icon.under {
  color: #f9a825;
}

/* amber */
.status-icon.missing {
  color: #c62828;
}

/* red */

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

.io-item button {
  margin-left: 8px;
  background: transparent;
  border: none;
  color: red;
  cursor: pointer;
}
</style>
