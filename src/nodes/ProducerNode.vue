<template>
  <div class="producer-node">
    <div class="header">Producer</div>
    <input
      v-model="editableLabel"
      class="label-input"
      @input="updateLabel"
      :placeholder="'Enter name...'"
    />
    <Handle type="source" :position="Position.Right" :id="'out'" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{ label: string }>()
const emit = defineEmits<{ (e: 'update:label', value: string): void }>()

const editableLabel = ref(props.label)

watch(() => props.label, (newVal) => {
  editableLabel.value = newVal
})

function updateLabel() {
  emit('update:label', editableLabel.value)
}
</script>

<style scoped>
.producer-node {
  padding: 12px;
  border-radius: 8px;
  background-color: #e8f5e9;
  border: 2px solid #4CAF50;
  font-family: 'Segoe UI', sans-serif;
  width: 140px;
  text-align: center;
  position: relative;
}

.header {
  font-weight: bold;
  margin-bottom: 6px;
  color: #2e7d32;
}

.label-input {
  width: 100%;
  border: none;
  background: transparent;
  text-align: center;
  font-size: 14px;
  font-family: inherit;
  color: #2e7d32;
  outline: none;
}
</style>
