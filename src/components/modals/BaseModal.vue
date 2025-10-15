<script setup lang="ts">
import { onMounted, onUnmounted, watch, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    closeOnEsc?: boolean
    closeOnBackdrop?: boolean
    ariaLabel?: string
  }>(),
  { closeOnEsc: true, closeOnBackdrop: true },
)

const emit = defineEmits<{ (e: 'update:open', v: boolean): void; (e: 'close'): void }>()
const root = ref<HTMLElement | null>(null)

function close() {
  emit('update:open', false)
  emit('close')
}
function onKey(e: KeyboardEvent) {
  if (props.closeOnEsc && e.key === 'Escape') close()
}
function onBackdrop(e: MouseEvent) {
  if (props.closeOnBackdrop && e.target === root.value) close()
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  document.body.style.overflow = props.open ? 'hidden' : ''
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})

watch(
  () => props.open,
  (v) => {
    document.body.style.overflow = v ? 'hidden' : ''
  },
)
</script>

<template>
  <teleport to="body">
    <div v-if="open" ref="root" class="backdrop" @click="onBackdrop">
      <div class="modal" role="dialog" aria-modal="true" :aria-label="ariaLabel || title">
        <header class="modal-header">
          <h2 v-if="title">{{ title }}</h2>
          <button class="icon" @click="close" aria-label="Close">✕</button>
        </header>
        <section class="modal-body"><slot /></section>
        <footer class="modal-footer"><slot name="footer" /></footer>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 30, 30, 0.5);
}
.modal {
  background: #fff;
  width: min(90vw, 640px);
  max-height: 90vh;
  border-radius: 12px;
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
}
.modal-body {
  overflow: auto;
  padding: 1rem;
}
.modal-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: end;
  gap: 0.5rem;
}
.icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}
</style>
