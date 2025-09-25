import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue/client'

import App from './App.vue'
import router from './router'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

import '@/styles/main.css'

const app = createApp(App)
const head = createHead()

app.use(head)
app.use(createPinia())
app.use(router)

app.mount('#app')
