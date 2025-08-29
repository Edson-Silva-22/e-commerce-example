import Default from "@/layouts/default.vue"
import { createRouter, createWebHistory } from "vue-router"

const routes = [
  {
    path: '/',
    component: Default,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/home.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/login.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/pages/register.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router