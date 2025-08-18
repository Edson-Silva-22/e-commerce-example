import { AuthGuard } from '../../auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService({ secret: 'secret' });
    guard = new AuthGuard(jwtService);
  });

  function createMockContext(headers: any = {}, cookies: any = {}) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
          cookies,
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('deve autorizar quando o token é válido no header', async () => {
    const context = createMockContext({
      authorization: 'Bearer validToken',
    });

    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ userId: 1 });

    const result = await guard.canActivate(context);

    expect(jwtService.verifyAsync).toHaveBeenCalledTimes(1);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('validToken', { secret: 'secret' });
    expect(result).toBe(true)
  });

  it('deve autorizar quando o token é válido no cookie', async () => {
    const context = createMockContext({}, { token: 'validToken' });

    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ userId: 1 });

    const result = await guard.canActivate(context);

    expect(jwtService.verifyAsync).toHaveBeenCalledTimes(1);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('validToken', { secret: 'secret' });
    expect(result).toBe(true);
  });

  it('deve lançar Unauthorized quando não tem token', async () => {
    const context = createMockContext();

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('deve lançar Session expired quando o token expirou', async () => {
    const context = createMockContext({
      authorization: 'Bearer expiredToken',
    });

    jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue('TokenExpiredError: jwt expired');

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException({ message: 'Session expired.', status: 401 }),
    );
  });
});
