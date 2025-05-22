import type { PaymentRequestData } from "@/pages/payment.vue"
import { useApi } from "@/plugins/httpClient"

export const usePaymentStore = defineStore('payment', () => {
  async function createPayment(dada: PaymentRequestData) {
    const response = await useApi('post', '/payments', dada)
    return response
  }

  return {
    createPayment
  }
})