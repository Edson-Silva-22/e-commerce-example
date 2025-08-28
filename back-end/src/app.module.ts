import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { RolesGuard } from './authorization/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URL!),
    UsersModule,
    AuthModule,
    AuthorizationModule
  ],
  controllers: [],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    }
  ],
})
export class AppModule {}
