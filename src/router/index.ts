import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '@/pages/EditorPage.vue'
import EditorLayout from '@/layouts/EditorLayout.vue'

const routes = [
  {
    path: '/',
    component: EditorLayout,
    children: [{ path: '', name: 'home', component: MainPage }],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
