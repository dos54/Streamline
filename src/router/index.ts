import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '@/pages/EditorPage.vue'
import EditorLayout from '@/layouts/EditorLayout.vue'
import ProjectView from '@/views/ProjectView.vue'

const routes = [
  {
    path: '/',
    component: EditorLayout,
    children: [{ path: '', name: 'home', component: MainPage }],
  },
  {
    path: '/project/:id',
    component: ProjectView,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
