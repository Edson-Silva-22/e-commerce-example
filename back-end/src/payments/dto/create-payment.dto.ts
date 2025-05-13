import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePaymentDto {
  @IsNotEmpty({message: 'O valor da compra deve ser informado'})
  @IsNumber({}, {message: 'O valor da compra deve ser um número'})
  transaction_amount: number;

  @IsNotEmpty({message: 'O id do método de pagamento deve ser informado'})
  @IsString({message: 'O id do método de pagamento deve ser um string'})
  payment_method_id: string;

  @IsNotEmpty({message: 'O tipo de método de pagamento deve ser informado'})
  @IsString({message: 'O tipo de método de pagamento deve ser um string'})
  payment_method_type: string

  @IsNotEmpty({message: 'O número de parcelas deve ser informado'})
  @IsNumber({}, {message: 'O número de parcelas deve ser um número'})
  installments: number;

  @IsOptional()
  @IsString({message: 'A descrição do pagamento deve ser um string'})
  description: string;

  @IsNotEmpty({message: 'O email do comprador deve ser informado'})
  @IsString({message: 'O email do comprador deve ser um string'})
  payer_email: string;

  @IsNotEmpty({message: 'O nome do comprador deve ser informado'})
  @IsString({message: 'O nome do comprador deve ser um string'})
  payer_name: string

  @IsNotEmpty({message: 'O tipo de identificação do comprador deve ser informado'})
  @IsString({message: 'O tipo de identificação do comprador deve ser um string'})
  payer_identification_type: string

  @IsNotEmpty({message: 'O número da identificação do comprador deve ser informado'})
  @IsString({message: 'O número da identificação do comprador deve ser um string'})
  payer_identification_number: string

  @IsOptional()
  @IsString({message: 'O token de segurança do cartão deve ser um string'})
  card_token: string;
}
