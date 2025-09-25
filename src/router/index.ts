import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'
import ProjectView from '@/views/ProjectView.vue'


const routes = [
  {
    path: '/project/:id',
    component: ProjectView,
  },
  {
    path: '/',
    redirect: '/project/demo-project', 
  },
]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
