<template>
  <div class="consumer-node">
    <div class="header">Consumer</div>
    <input
      v-model="editableLabel"
      class="label-input"
      @input="updateLabel"
      :placeholder="'Enter name...'"
    />
    <Handle type="target" :position="Position.Left" :id="'in'" />
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
.consumer-node {
  padding: 12px;
  border-radius: 8px;
  background-color: #fff3e0;
  border: 2px solid #ff9800;
  font-family: 'Segoe UI', sans-serif;
  width: 140px;
  text-align: center;
  position: relative;
}

.header {
  font-weight: bold;
  margin-bottom: 6px;
  color: #e65100;
}

.label-input {
  width: 100%;
  border: none;
  background: transparent;
  text-align: center;
  font-size: 14px;
  font-family: inherit;
  color: #e65100;
  outline: none;
}
</style>
