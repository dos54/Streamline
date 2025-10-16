<template>
  <BaseModal v-model:open="open" title="Summary">
    <table>
      <thead>
        <tr>
          <th>Resource</th>
          <th>Unit</th>
          <th>Produced/s</th>
          <th>Consumed/s</th>
          <th>Net/s</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.resourceId + r.unitId">
          <td>{{ r.resourceName }}</td>
          <td>{{ r.unitLabel }}</td>
          <td>{{ r.producedPerSec }}</td>
          <td>{{ r.consumedPerSec }}</td>
          <td :style="{ color: r.netPerSec > 0 ? 'green' : 'crimson' }">{{ r.netPerSec }}</td>
        </tr>
      </tbody>
    </table>
    <template #footer>
      <button @click="open = false">Cancel</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectStore } from '@/stores/project.store'
import BaseModal from '@/components/modals/BaseModal.vue'

const project = useProjectStore()
const rows = computed(() => project.summary)

const open = defineModel<boolean>('open', { required: true })
</script>

<style scoped>
table {
  border: 2px solid lightgray;
  width: 100%;
  border-radius: 4px;
}

th {
  border-bottom: 1px solid lightgray;
  border-right: 1px solid lightgray;
}

td {
  border-right: 1px solid lightgray;
  border-bottom: 1px solid lightgray;
}

tr:nth-child(even) {
  background-color: aliceblue;
}
</style>
