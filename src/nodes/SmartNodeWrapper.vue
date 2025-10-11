<template>
  <SmartNode :id="id" :type="type" :data="data" :project="project"  :status-types="data.statusTypes"/>
</template>

<script setup lang="ts">
import SmartNode from './SmartNode.vue'
import { useProjectStore } from '@/stores/project.store'

const props = defineProps<{
  id: string
  type: string
  data: {
    label?: string
    direction?: string
    cycleTime?: number
    resources?: {
      id: string
      name: string
      defaultUnitId?: string
      category?: string
      precision?: number
      aliases?: string[]
    }[]
    statusTypes?: string[] // ✅ Add this line
  }
}>()


const project = useProjectStore()
</script>
