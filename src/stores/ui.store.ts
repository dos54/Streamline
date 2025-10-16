import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import router from '@/router'

export const useUiStore = defineStore('ui', () => {
  const route = router.currentRoute
  const settingsOpen = ref(false)
  const importPanelVisible = ref(false) // ✅ NEW: controls Import JSON panel

  // 🔁 Sync settingsOpen with query param
  watch(
    route,
    (r) => {
      settingsOpen.value = r.query.settings === '1'
    },
    { immediate: true },
  )

  watch(settingsOpen, (v) => {
    const q = { ...route.value.query }
    if (v) {
      q.settings = '1'
    } else {
      delete q.settings
    }

    if ((route.value.query.settings === '1')! == v) {
      if (v) {
        router.push({ query: q })
      } else {
        router.replace({ query: q })
      }
    }
  })

  // 🧭 Settings panel controls
  function openSettings() {
    settingsOpen.value = true
  }

  function closeSettings() {
    settingsOpen.value = false
  }

  // 📦 Import panel controls
  function toggleImportPanel() {
    importPanelVisible.value = !importPanelVisible.value
  }

  function openImportPanel() {
    importPanelVisible.value = true
  }

  function closeImportPanel() {
    importPanelVisible.value = false
  }

  return {
    openSettings,
    closeSettings,
    settingsOpen,
    importPanelVisible,
    toggleImportPanel,
    openImportPanel,
    closeImportPanel,
  }
})
