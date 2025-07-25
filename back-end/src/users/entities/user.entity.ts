import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export enum Rules {
  ADMIN = 'admin',
  CLIENT = 'client',
  SELLER = 'seller',
}

@Schema({
  timestamps: true,
})
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  cpf: string;
  
  @Prop()
  password: string;
  
  @Prop()
  avatar: string;
  
  @Prop()
  rules: Rules[]
  
  @Prop()
  phone: string;
}

export const UserSchema = SchemaFactory.createForClass(User);