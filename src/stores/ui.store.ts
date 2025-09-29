import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import router from '@/router'

export const useUiStore = defineStore('ui', () => {
  const route = router.currentRoute
  const settingsOpen = ref(false)

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

  function openSettings() {
    settingsOpen.value = true
  }

  function closeSettings() {
    settingsOpen.value = false
  }

  return { openSettings, closeSettings, settingsOpen }
})
