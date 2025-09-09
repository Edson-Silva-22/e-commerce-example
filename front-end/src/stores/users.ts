import { useApi } from "@/plugins/http-client"
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UserDto {
  name: string
  email: string
  cpf: string
  password: string
  phone: string
}

export const useUserStore = defineStore('user', () => {
  const loading = ref(false)
  
  async function create(userDto: UserDto) {
    loading.value = true
    const response = await useApi('post', 'users', userDto)

    if(response) return response
    loading.value = false
  }

  return{
    create,
    loading
  }
})