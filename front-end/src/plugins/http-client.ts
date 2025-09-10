import axios from "axios";
import { useAlertStore } from "@/stores/alert";

export const endPoint = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true
  });

/**
 * Realiza requisições para o backend
 * @param method método da requisição
 * @param url URL de destino
 * @param data dados que devem ser enviados
 */
export async function useApi(
  method:'get'|'post'|'put'|'delete'|'options'|'patch', 
  url:string, 
  data?:any, 
  headers?:any
) {
  const useAlert = useAlertStore()
  const router = useRouter()

  try {
    const response = await endPoint.request({
      method,
      url,
      data,
      headers,
    })

    if(response.status === 200 || response.status == 201){
      return response.data
    }
    
  } catch (error:any) {
    if (Array.isArray(error.response.data.message)) {
      error.response.data.message.map(async (m:string) => {
        useAlert.createAlert(m, 'error')
      })
    }

    else if (error.response.data.message == 'Session expired') {
      router.push('/login')
      useAlert.createAlert('Sessão expirada.', 'error')
    }

    else if(error.response.data.message !== 'Unauthorized'){
      useAlert.createAlert(error.response.data.message, 'error')      
    }
  }
}