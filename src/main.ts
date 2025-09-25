import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@vue-flow/core/dist/style.css'
import { db } from './db/dexie'

// Optional: expose Dexie to browser console for debugging
;(window as any).db = db

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

  // ✅ Now mount the app
  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.mount('#app')
})()
