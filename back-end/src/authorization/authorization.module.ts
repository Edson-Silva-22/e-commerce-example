import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../users/entities/user.entity";
import { RolesGuard } from "./roles.guard";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [],
  providers: [RolesGuard],
  exports: [MongooseModule]
})
export class AuthorizationModule {}