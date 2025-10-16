<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import AddUnit from '@/components/forms/AddUnit.vue'
const open = defineModel<boolean>('open', { required: true })
const submitting = ref(false)
</script>

<template>
  <BaseModal v-model:open="open" title="Add Unit">
    <AddUnit @submitting="(v) => (submitting = v)" @saved="open = false" />
    <template #footer>
      <button @click="open = false">Cancel</button>
      <button :disabled="submitting" form="unit-form" type="submit">Save</button>
    </template>
  </BaseModal>
</template>
