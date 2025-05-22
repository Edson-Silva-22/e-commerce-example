import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

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
  handleWebhook(@Req() req: Request, @Body() body: any) {
    console.log('Notificação recebida do Mercado Pago:', body);
    return { received: true };
  }

}
