import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty({message: 'O nome deve ser informado'})
  @IsString({message: 'O nome deve ser uma string'})
  name: string;

  @IsNotEmpty({message: 'O email deve ser informado'})
  @IsString({message: 'O email deve ser uma string'})
  @IsEmail({}, {message: 'O email deve ser válido'})
  email: string;

  @IsNotEmpty({message: 'A senha deve ser informada'})
  @IsString({message: 'A senha deve ser uma string'})
  password: string;
}
