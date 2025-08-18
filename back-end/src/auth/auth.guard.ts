import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException({message: 'Unauthorized', status: 401});
      }

      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: process.env.JWT_SECRET ?? 'secret',
        }
      );
  
      request['user'] = payload;

      return true;
    } catch (error) {
      console.error(error)
      if (error == 'TokenExpiredError: jwt expired') {
        throw new UnauthorizedException({message: 'Session expired.', status: 401});
      }

      throw new UnauthorizedException({message: 'Unauthorized', status: 401});
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    //pegando o token do cabeçalho da requisição
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if(type === 'Bearer' && token) return token;

    //pegando o token do cookie da requisição
    if (request.cookies?.token) return request.cookies.token;

    return undefined;
  }
}