<template>
  <!-- Floating Toggle Button -->
  <button @click="isOpen = !isOpen" class="toggle-button">
    {{ isOpen ? 'Hide Import Panel' : 'Show Import Panel' }}
  </button>

  <!-- Floating Import Panel -->
  <div v-show="isOpen" class="json-import-wrapper">
    <div class="json-import">
      <h2>Import Node JSON</h2>

      <textarea
        v-model="jsonText"
        placeholder="Paste your JSON here"
        rows="10"
        class="json-textarea"
      ></textarea>

      <input type="file" accept=".json" @change="handleFileUpload" />
      <button @click="validateJson">Validate</button>

      <div v-if="validationResult">
        <p v-if="validationResult.valid" style="color: green">✅ JSON is valid!</p>
        <ul v-else style="color: red">
          <li v-for="(error, index) in validationResult.errors" :key="index">
            {{ error.message }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import { validateNodeJson } from '../utils/nodeValidator'

const isOpen = ref(false)
const jsonText = ref('')
const validationResult = ref<ReturnType<typeof validateNodeJson> | null>(null)

function validateJson() {
  try {
    const parsed = JSON.parse(jsonText.value)
    validationResult.value = validateNodeJson(parsed)
  } catch (err) {
    validationResult.value = {
      valid: false,
      errors: [{ message: 'Invalid JSON format' }]
    }
  }
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
