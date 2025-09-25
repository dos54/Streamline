<template>
  <div class="node-resource-editor">
    <label>{{ resource.name }}</label>
    <div>
      <span>Unit: {{ nodeResource.unitId }}</span>
      <input
        type="number"
        v-model.number="localPerCycle"
        @input="emitUpdate"
        min="0"
      />
      <span>per cycle</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { NodeResource } from '@/types/nodeResource'
import type { Resource } from '@/types/resource'

const props = defineProps<{
  nodeResource: NodeResource
  resource: Resource
}>()

const emit = defineEmits(['update:perCycle'])

const localPerCycle = ref(props.nodeResource.perCycle)

watch(() => props.nodeResource.perCycle, (newVal) => {
  localPerCycle.value = newVal
})

function emitUpdate() {
  emit('update:perCycle', localPerCycle.value)
}
</script>

<style scoped>
.node-resource-editor {
  margin-bottom: 1rem;
}
</style>
