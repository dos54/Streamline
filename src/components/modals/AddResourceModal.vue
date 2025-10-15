<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import AddResource from '@/components/forms/AddResource.vue'
const open = defineModel<boolean>('open', { required: true })
const submitting = ref(false)
</script>

<template>
  <BaseModal v-model:open="open" title="Add Resource">
    <AddResource @submitting="v => submitting = v" @saved="open = false" />
    <template #footer>
      <button @click="open = false">Cancel</button>
      <button :disabled="submitting" form="resource-form" type="submit">Save</button>
    </template>
  </BaseModal>
</template>
