import Default from "@/layouts/default.vue"
import { useAuthStore } from "@/stores/auth"
import { createRouter, createWebHistory, type RouteLocationNormalizedLoaded } from "vue-router"

declare module 'vue-router' {
  interface RouteMeta {
    //permissões para acessar
    // roles?: string[]

    //exige autenticação
    requiresAuth?: boolean
  }
}

const routes = [
  {
    path: '/',
    component: Default,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/home.vue'),
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'profile/:id',
        name: 'profile',
        component: () => import('@/pages/profile.vue'),
        meta: {
          requiresAuth: true
        }
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

router.beforeEach(async (to: RouteLocationNormalizedLoaded) => {
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    const isAuthenticated = await authStore.me()

    if (isAuthenticated) {
      return true
    }

    else {
      return { path: '/login' }
    }
  }

  else {
    return true
  }
})

export default router