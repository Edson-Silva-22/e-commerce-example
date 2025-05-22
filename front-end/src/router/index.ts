import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import Default from '@/layouts/default.vue'

const routes = [
  {
    path: '/',
    component: Default,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import("@/pages/home.vue")
      },
      {
        path: '/payment',
        name: 'payment',
        component: () => import("@/pages/payment.vue")
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
})

export default router
