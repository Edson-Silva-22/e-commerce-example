import { useApi } from "@/plugins/http-client"

export const useAuthStore = defineStore('auth', () => {
  const userAuth = ref<{
    _id: string
    name: string
    email: string
    cpf: string
    roles: string[],
    phone: string
  } | null>(null)
  const loading = ref(false)

  async function login(email: string, password: string) {
    loading.value = true
    const response = await useApi('post', 'auth', { email, password })
    await me()
    loading.value = false

    if (response) return response
  }

  async function me() {
    const response = await useApi('get', 'users/me')

    if (response) {
      userAuth.value = response
      return true
    }
    
    else {
      userAuth.value = null
      return false
    }
  }

  return {
    login,
    me,
    userAuth,
    loading
  }
})