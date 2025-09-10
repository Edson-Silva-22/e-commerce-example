import { Controller, Post, Body, Res, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async login(@Body() createAuthDto: CreateAuthDto, @Res({ passthrough: true }) response: Response) {
    const token = await this.authService.login(createAuthDto);
    response.cookie('token', token.token, {
      httpOnly: true, // Impede acesso via JavaScript (protege contra XSS)
      secure: false, // Só envia o cookie em conexões HTTPS
      sameSite: 'strict', // Protege contra CSRF
      maxAge: 1000 * 60 * 60 * 24 * 7, // Define validade do cookie (em milissegundos)
    });
    return 'Login successful'
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('token', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });
    return 'Logout successful'
  }
}
