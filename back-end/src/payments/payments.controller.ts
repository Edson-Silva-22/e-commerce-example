import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.createPayment(createPaymentDto);
  }

  // webhook que recebe a notificação do mercado pago
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() body: any) {
    await this.paymentsService.sendPaymentNotification(body)
    return { received: true };
  }

}
