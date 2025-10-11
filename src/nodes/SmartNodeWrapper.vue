<template>
  <SmartNode :data="data" :project="project" />
</template>

<script setup lang="ts">
import SmartNode from './SmartNode.vue'
import { useProjectStore } from '@/stores/project.store'

// Vue Flow will pass `data` into this component automatically
const props = defineProps<{ data: any }>()


const project = useProjectStore()
</script>
