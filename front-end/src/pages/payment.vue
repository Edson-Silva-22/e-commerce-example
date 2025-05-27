<template>
  <v-container>
    <Alert></Alert>

    <h1>Pagamento</h1>
    
    <v-stepper 
      v-model="step"
      alt-labels
      next-text="Próximo"
      prev-text="Anterior"
      color="#56105f"
    >
      <template v-slot:default="{ prev, next }">
        <v-stepper-header>
          <template 
            v-for="(item, index) in steps"
            :key="index"
          >
            <v-stepper-item
              :value="item.value"
              :complete="step > item.value"
              color="#56105f"
            >
              <span 
                v-if="display.width.value < 500 && item.value == step" 
                style="color: #56105f; 
                font-weight: 700;"
              >{{ item.title }}</span>

              <span 
                v-if="display.width.value >= 500"
                style="color: #56105f; 
                font-weight: 700;"
              >{{ item.title }}</span>
            </v-stepper-item>
    
            <v-divider
              v-if="item.value !== steps.length"
              :key="index"
            ></v-divider>
          </template>
        </v-stepper-header>

        <v-stepper-window>
          <v-stepper-window-item :value="1">
            <div class="divForm">
              <p>Teclado Game</p>
              <h2>R$ 199.99</h2>
              <v-number-input
                control-variant="stacked"
                variant="solo"
                label="Quantidade"
                bg-color="#f4f4f6"
              ></v-number-input>
              <h2>Valor Total: R$ 199.99</h2>
            </div>
          </v-stepper-window-item>

          <v-stepper-window-item :value="2">
            <div class="divForm">
              <div>
                <label>Nome</label>
                <input 
                  class="inputCardForm input" 
                  placeholder="Informe seu nome"
                  v-model="paymentRequestData!.payer_name"
                ></input>
              </div>

              <div>
                <label>Email</label>
                <input 
                  class="inputCardForm input" 
                  placeholder="exemplo@gmail.com"
                  v-model="paymentRequestData!.payer_email"
                ></input>
              </div>

              <div>
                <label>CPF</label>
                <input 
                  class="inputCardForm input" 
                  placeholder="Informe seu CPF"
                  v-model="paymentRequestData!.payer_identification_number"
                ></input>
              </div>
            </div>
          </v-stepper-window-item>

          <v-stepper-window-item :value="3">
            <v-card 
              v-for="(item, index) in paymentMethods"
              :key="index"
              color="#56105f"
              :variant="item.type == paymentMethodSelected ? 'elevated' : 'outlined'"
              class="d-flex align-center vcard"
              @click="paymentMethodSelected = item.type"
            >
              <div>
                <v-icon :icon="item.icon" size="64"></v-icon>
              </div>
              <v-card-title>{{ item.title }}</v-card-title>
            </v-card>
          </v-stepper-window-item>
          
          <v-stepper-window-item :value="4">
            <div v-if="loading" class="d-flex justify-center align-center">
              <v-progress-circular
                color="#56105f"
                indeterminate
                size="84"
              ></v-progress-circular>
            </div>

            <form v-if="paymentMethodSelected == 'credit_card' && !loading" id="form-checkout" class="divForm">
              <div>
                <label>Número do Cartão</label>
                <div id="cardNumber" class="inputCardForm"></div>
              </div>

              <div>
                <label>Data de vencimento</label>
                <div id="form-checkout__expirationDate" class="inputCardForm"></div>
              </div>

              <div>
                <label>Código de segurança</label>
                <div id="form-checkout__securityCode" class="inputCardForm"></div>
              </div>

              <div class="d-flex justify-center">
                <v-btn 
                  @click="submitPayment" 
                  width="250" 
                  color="#56105f"
                  height="56"
                >Pagar</v-btn>
              </div>
            </form>

            <div v-if="paymentMethodSelected == 'pix' && !loading" class="divForm d-flex align-center flex-column">
              <v-icon icon="mdi-check-circle-outline" size="64" color="#56105f"></v-icon>
              <h2>Realize o Pagamento Pelo Pix</h2>
              <img :src="qrcode.qrcodeBase64" alt="qrcode" width="250" height="250">

              <div class="w-100 d-flex mb-2">
                <p class="pQrcode">{{ qrcode.qrcode }}</p>
                <v-btn color="#56105f" variant="tonal" @click="copyQrcode">Copiar QR code</v-btn>
              </div>

              <p class="w-100">1. Acesse o aplicativo do seu banco</p>
              <p class="w-100">2. Escolha pagar com Pix</p>
              <p class="w-100">3. Clique na opção de ler QR code</p>
              <p class="w-100">4. Após ler o QR code, aguarde até que o pagamento seja confirmado</p>

              <h2 class="mt-10">Resumo do Pedido</h2>
              <span class="resumoSpan">Produto</span>
              <p class="w-100 mb-5">Teclado Gamer a5Pro</p>

              <span class="resumoSpan">Total a Pagar</span>
              <p class="w-100 mb-5">R$ 199.99</p>

              <span class="resumoSpan">Comprador</span>
              <p class="w-100 mb-5">{{ paymentRequestData.payer_email }}</p>
            </div>
          </v-stepper-window-item>
        </v-stepper-window>

        <v-stepper-actions>
          <template v-slot:prev>
            <v-btn 
              @click="prev"
              color="#56105f"
              variant="tonal"
            >Anterior</v-btn>
          </template>

          <template v-slot:next>
            <v-btn 
              @click="next"
              color="#56105f"
              variant="tonal"
            >Próximo</v-btn>
          </template>
        </v-stepper-actions>
      </template>
    </v-stepper>
  </v-container>
</template>

<script setup lang="ts">
import { usePaymentStore } from '@/stores/payments';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import Alert from '@/components/Alert.vue';
import { useAlertStore } from '@/stores/alert';
import socketClient from '@/plugins/socketClient';
import { useDisplay } from 'vuetify';
import { useRouter } from 'vue-router';
  export interface PaymentRequestData {
    transaction_amount: number,
    payment_method_id: string,
    payment_method_type: string,
    installments?: number,
    description?: string,
    payer_email: string,
    payer_name: string,
    payer_identification_type: string,
    payer_identification_number: string,
    card_token?: string
  }

  const router = useRouter()
  const display = useDisplay()
  const alertStore = useAlertStore()
  const paymentStore = usePaymentStore()
  const paymentRequestData = ref<PaymentRequestData>({
    transaction_amount: 199.99,
    payment_method_id: '',
    payment_method_type: '',
    payer_email: 'test_user_1175059032@testuser.com',
    payer_name: '',
    payer_identification_type: 'CPF',
    payer_identification_number: ''
  })
  let mercadoPagoConfig: any;
  const steps = ref([
    {
      value: 1,
      title: 'Produto'
    },
    {
      value: 2,
      title: 'Dados do Comprador'
    },
    {
      value: 3,
      title: 'Método de Pagamento'
    },
    {
      value: 4,
      title: 'Pagamento'
    }
  ])
  const step = ref(1);
  let cardFormMounted = false
  const paymentMethods = ref([
    {
      type: 'pix',
      title: 'Pix',
      icon: 'mdi-qrcode'
    },
    {
      type: 'boleto',
      title: 'Boleto',
      icon: 'mdi-barcode'
    },
    {
      type: 'credit_card',
      title: 'Cartão de Crédito',
      icon: 'mdi-credit-card-outline'
    }
  ])
  const paymentMethodSelected = ref('')
  const qrcode = ref({
    qrcode: '',
    qrcodeBase64: ''
  })
  const loading = ref(false)

  async function copyQrcode() {
    try {
      await navigator.clipboard.writeText(qrcode.value.qrcode)
      alertStore.createAlert('Texto copiado com sucesso!', 'success')
    } catch (error) {
      console.error(error)
      alertStore.createAlert('Erro ao copiar o texto', 'error')
    }
  }

  async function submitPayment() {    
    if(paymentMethodSelected.value == "pix") {
      loading.value = true
      paymentRequestData.value!.payment_method_id = "pix"
      paymentRequestData.value.payment_method_type = 'bank_transfer'
      paymentRequestData.value!.description = 'pagamento com pix'

      const response = await paymentStore.createPayment(paymentRequestData.value)

      qrcode.value = {
        qrcode: response.transactions.payments[0].payment_method.qr_code,
        qrcodeBase64: `data:image/png;base64,${response.transactions.payments[0].payment_method.qr_code_base64}`
      }
      loading.value = false
    }

    if (paymentMethodSelected.value == 'credit_card') {
      const getCardToken = await mercadoPagoConfig.fields.createCardToken({
        cardholderName: paymentRequestData.value.payer_name,
        identificationType: paymentRequestData.value.payer_identification_type,
        identificationNumber: paymentRequestData.value.payer_identification_number
      })

      paymentRequestData.value.card_token = getCardToken.id
      paymentRequestData.value.installments = 5
      paymentRequestData.value!.payment_method_id = "master"
      paymentRequestData.value.payment_method_type = 'credit_card'
      paymentRequestData.value!.description = 'pagamento com cartão de crédito'
      
      loading.value = true
      const response = await paymentStore.createPayment(paymentRequestData.value)
      loading.value = false
      if (response.transactions.payments[0].status == "processed") router.push('/purchase-completed')
    }
  }

  watch(step, async (value) => {
    if(value === 4 && !cardFormMounted && paymentMethodSelected.value == "credit_card") {
      // nextTick() é uma função do Vue usada para esperar até que o DOM esteja completamente atualizado após alguma mudança reativa.
      // Nesse caso espera o DOM estar atualizado antes de executar a próxima linha de código.
      await nextTick()

      // A criação dos campos abaixo são exigidas pelo sdk do mercado pago para que o token do cartão seja criado, pois esse token é necessário para que se possa usar o método de pagamento por cartão
      mercadoPagoConfig.fields.create('cardNumber', {
        placeholder: 'Número do cartão',
        style: { },
      }).mount('cardNumber')

      mercadoPagoConfig.fields.create('expirationDate', {
        placeholder: 'MM/AA'
      }).mount('form-checkout__expirationDate')

      mercadoPagoConfig.fields.create('securityCode', {
        placeholder: 'Código de segurança'
      }).mount('form-checkout__securityCode')

      cardFormMounted = true
    }

    if (value === 4 && paymentMethodSelected.value != 'credit_card') await submitPayment() 
  })

  onMounted(async () => {
    await loadMercadoPago()
    //@ts-ignore
    mercadoPagoConfig = new MercadoPago("APP_USR-4ba53d08-77fb-40a4-9c42-cdeec46e34dc")

    // Conectando-se ao socket com o namespace messages
    socketClient.connect('payments')
    // Evento para receber notificações de pagamento
    socketClient.subscribeEvent('notifyPayment', (paymentResponse: any) => {
      if(paymentResponse.paymentStatus == 'approved') router.push('/purchase-completed')
    })
  })

  onUnmounted(() => {
    // Desinscrevendo de todos os eventos
    socketClient.unsubscribeAllEvents()
    // Desconectando-se do socket com o namespace messages
    socketClient.disconnect()
  })
</script>

<style scoped>
@import "@/styles/payment.page.css";
</style>