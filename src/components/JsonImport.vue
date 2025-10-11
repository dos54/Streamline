<template>
  <!-- Floating Toggle Button -->
  <button @click="isOpen = !isOpen" class="toggle-button">
    {{ isOpen ? 'Hide Import Panel' : 'Show Import Panel' }}
  </button>

  <!-- Floating Import Panel -->
  <div v-show="isOpen" class="json-import-wrapper">
    <div class="json-import">
      <h2>Import Node JSON</h2>

      <textarea v-model="jsonText" placeholder="Paste your JSON here" rows="10" class="json-textarea"></textarea>

      <input type="file" accept=".json" @change="handleFileUpload" />
      <button @click="validateJson">Validate</button>

      <button @click="clearCanvas" class="btn danger">
        Clear Canvas
      </button>

      <div v-if="validationResult && validationResult.valid" style="color: green">
        ✅ JSON is valid!
      </div>

      <div v-if="validationResult && !validationResult.valid">
        <ul style="color: red">
          <li v-for="(error, index) in validationResult.errors" :key="index">
            {{ error.message }}
          </li>
        </ul>
      </div>

      <div v-if="errorMessage && (!validationResult || !validationResult.valid)" style="color: red; margin-top: 0.5rem">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import { validateNodeJson } from '../utils/nodeValidator'
import type { ZodIssue } from 'zod'
import { GraphEdgeZ } from '@/schemas/graphEdge.schema'
import { z } from 'zod'

type GraphEdge = z.infer<typeof GraphEdgeZ>

const emit = defineEmits<{
  (e: 'inject', payload: { nodes: any[]; edges: GraphEdge[] }): void
  (e: 'clear'): void
}>()

const { fitView } = useVueFlow()

const isOpen = ref(false)
const jsonText = ref('')
const errorMessage = ref('')
const validationResult = ref<{
  valid: boolean
  errors: ZodIssue[]
} | null>(null)

function enrichEdges(rawEdges: any[], nodes: any[]): GraphEdge[] {
  return rawEdges.map((e): GraphEdge => {
    const sourceNode = nodes.find(n => n.id === e.source)
    const output = sourceNode?.data?.outputs?.find((o: { resourceId: string; unitId?: string }) => o.resourceId === e.sourceHandle)


    const resourceId = output?.resourceId ?? e.sourceHandle
    const unitId = output?.unitId ?? ''

    return {
      ...e,
      resourceId,
      unitId,
      label: `${resourceId} (${unitId})`,
      enabled: true
    }
  })
}

function validateJson() {
  try {
    console.log('Raw input:', jsonText.value)
    const parsed = JSON.parse(jsonText.value)

    const nodes = Array.isArray(parsed) ? parsed : parsed.nodes
    const rawEdges = Array.isArray(parsed) ? [] : parsed.edges ?? []
    const edges = enrichEdges(rawEdges, nodes)

    const result = validateNodeJson(nodes)
    validationResult.value = result

    if (result.valid) {
      errorMessage.value = ''
      console.log('✅ Injecting nodes:', nodes)
      console.log('🔗 Injecting edges:', edges)
      emit('inject', { nodes, edges })

      setTimeout(() => {
        fitView({ padding: 0.2 })
      }, 100)
    } else {
      errorMessage.value =
        'Validation failed: ' +
        result.errors.map((e) => e.message).join(', ')
    }
  } catch (err) {
    errorMessage.value = 'Invalid JSON format'
    validationResult.value = null
  }
}

function clearCanvas() {
  console.log('🧹 Clear button clicked')
  emit('clear')
}

function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    jsonText.value = reader.result as string
  }
  reader.readAsText(file)
}
</script>

<style scoped>
.toggle-button {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 10000;
  padding: 0.5rem 1rem;
  font-weight: bold;
  background-color: #fffa;
  border: 1px solid #ccc;
  cursor: pointer;
}

.json-import-wrapper {
  position: fixed;
  top: 4rem;
  left: 1rem;
  z-index: 9999;
}

.json-import {
  padding: 1rem;
  background: #f9f9f9;
  border: 1px solid #ccc;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  width: 300px;
}

.json-textarea {
  width: 100%;
  font-family: monospace;
  margin-bottom: 1rem;
}
</style>
