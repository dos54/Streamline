import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue/client'
import { vuetify } from './plugins/vuetify'

import App from './App.vue'
import router from './router'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@mdi/font/css/materialdesignicons.css'

import '@/styles/main.css'

const head = createHead()

// Seed Dexie with a demo project, then mount the app
;(async () => {
  // ✅ Now mount the app
  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.use(head)
  app.use(vuetify)
  app.mount('#app')
})()
