import { Test, TestingModule } from "@nestjs/testing";
import { Response } from "express";
import { AuthController } from "../../auth.controller";
import { AuthService } from "../../auth.service";
import { CreateAuthDto } from "../../dto/create-auth.dto";
import { JwtService } from "@nestjs/jwt";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { AuthUserType } from "src/utils/decorators/auth-user.decorator";

const authServiceMock = {
  login: jest.fn(),
  getAuthUser: jest.fn()
}

describe('Auth Cotroller', () => {
  let authController: AuthController;
  let authService: AuthService
  const createAuthDto: CreateAuthDto = {
    email: 'alex@email',
    password: '123456'
  }
  // Mock do Response do Express
  const response = {
    cookie: jest.fn()
  } as unknown as Response;

  beforeAll(async () => {
    const authModuleTest:TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        JwtService,
      ]
    }).compile()

    authController = authModuleTest.get<AuthController>(AuthController);
    authService = authModuleTest.get<AuthService>(AuthService);
  })

  afterEach(() => {
    jest.clearAllMocks();
  })

  it('should be defined', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
  })

  describe('Login Method', () => {
    it('should login a user', async () => {
      const tokenMock = { token: 'fake-jwt-token' };
      (authService.login as jest.Mock).mockResolvedValue(tokenMock)

      const result = await authController.login(createAuthDto, response);

      // Verifica se o authService.login foi chamado corretamente
      expect(authService.login).toHaveBeenCalledWith(createAuthDto);

      // Verifica se o cookie foi setado com os parâmetros corretos
      expect(response.cookie).toHaveBeenCalledWith(
        'token',
        tokenMock.token,
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60 * 24 * 7
        })
      );

      expect(result).toBe('Login successful');
    })

    it('should throw an error if user email not found', async () => {
      (authService.login as jest.Mock).mockRejectedValue(new BadRequestException('User not found'));

      await expect(authController.login(createAuthDto, response)).rejects.toThrow(BadRequestException);

      expect(authService.login).toHaveBeenCalledTimes(1)
      expect(authService.login).toHaveBeenCalledWith(createAuthDto)
    })

    it('should throw an error if password is incorrect', async () => {
      (authService.login as jest.Mock).mockRejectedValue(new BadRequestException('Password incorrect'))

      await expect(authController.login(createAuthDto, response)).rejects.toThrow(BadRequestException)

      expect(authService.login).toHaveBeenCalledTimes(1)
      expect(authService.login).toHaveBeenCalledWith(createAuthDto)
    })

    it('should throw an error if token is not generated', async () => {
      (authService.login as jest.Mock).mockRejectedValue(new InternalServerErrorException('Internal server error. It was not possible to login.'))

      await expect(authController.login(createAuthDto, response)).rejects.toThrow(InternalServerErrorException)

      expect(authService.login).toHaveBeenCalledTimes(1)
      expect(authService.login).toHaveBeenCalledWith(createAuthDto)
    })
  })
})