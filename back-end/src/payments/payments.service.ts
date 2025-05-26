import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MercadoPagoConfig, Order, Payment} from 'mercadopago';
import { PaymentsGateway } from './payments.gateway';

@Injectable()
export class PaymentsService {
  private mercadopago: MercadoPagoConfig;
  private orderClient: Order;
  private paymentClient: Payment;

  constructor(
    private readonly paymentsGateway: PaymentsGateway
  ) {
    this.mercadopago = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    });

    this.orderClient = new Order(this.mercadopago);
    this.paymentClient = new Payment(this.mercadopago);
  }

  async createPayment(createPaymentDto: CreatePaymentDto) {
    try {
      const createNewOrder = await this.orderClient.create({
        body: {
          type: 'online',
          external_reference: 'order-123',
          processing_mode: "automatic",
          transactions: {
            payments: [
              {
                amount: `${createPaymentDto.transaction_amount}`,
                payment_method: {
                  id: createPaymentDto.payment_method_id,
                  type: createPaymentDto.payment_method_type,
                  installments: createPaymentDto.installments,
                  statement_descriptor: createPaymentDto.description,
                  token: createPaymentDto.card_token ? createPaymentDto.card_token : undefined
                }
              }
            ]
          },
          payer: {
            email: createPaymentDto.payer_email,
            first_name: createPaymentDto.payer_name,
            identification: {
              type: createPaymentDto.payer_identification_type,
              number: createPaymentDto.payer_identification_number
            }
          },
          total_amount: `${createPaymentDto.transaction_amount}`
        }
      })

      return createNewOrder; 
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Devido ao um erro interno, não foi relogado o pagamento.')
    }
  }

  async sendPaymentNotification(payment: any) {
    try {
      const findPayment = await this.paymentClient.get({id: payment.data.id})
      // Verificar se o pagamento foi aprovado para enviar a notificação
      if(findPayment.status == 'approved') {
        this.paymentsGateway.notifyPayment({
          message: 'Pagamento realizado com sucesso!', 
          payment,
          paymentStatus: findPayment.status,
        })
      }

    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Devido ao um erro interno, não foi notificar o pagamento.')
    }    
  }
}
