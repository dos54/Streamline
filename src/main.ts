import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue/client'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'

import App from './App.vue'
import router from './router'
import { db } from './db/dexie'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@/styles/main.css'

const head = createHead()
const pinia = createPinia()

// Seed Dexie with a demo project, then mount the app
;(async () => {
  await db.projects.clear()

  await db.projects.put({
    id: 'demo-project',
    name: 'Demo Project',
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: {
      baseTimeUnitId: 's',
      defaultRateDisplay: 'per_s',
      resourceDefaultUnits: {
        r1: 'u1',
        r2: 'u2',
      },
      balancing: {
        mode: 'per_time',
        targetTimeUnitId: 's',
        tolerance: 0.01,
      },
      ui: {
        snapToGrid: true,
        gridSize: 16,
        minimap: true,
      },
    },
    units: [
      {
        id: 'u1',
        name: 'Liter',
        symbol: 'L',
        baseUnit: 'L',
        factor: 1,
        dimension: 'volume',
        aliases: ['litre', 'ℓ'],
      },
      {
        id: 'u2',
        name: 'Kilowatt-hour',
        symbol: 'kWh',
        baseUnit: 'Wh',
        factor: 1000,
        dimension: 'energy',
        aliases: ['kW·h'],
      },
    ],
    resources: [
      { id: 'r1', name: 'Water', defaultUnitId: 'u1' },
      { id: 'r2', name: 'Electricity', defaultUnitId: 'u2' },
    ],
    nodes: [],
    edges: [],
  })

  const app = createApp(App)
  app.use(pinia)
  app.use(router)
  app.use(head)
  app.use(FloatingVue) // ✅ Tooltip plugin installed
  app.mount('#app')
})()
