import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../../auth.service";
import { User } from "../../../users/entities/user.entity";
import * as bcrypt from 'bcrypt';
import { CreateAuthDto } from "../../dto/create-auth.dto";
import { JwtService } from "@nestjs/jwt";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";

const mockUserModel = {
  findOne: jest.fn(),
  findById: jest.fn()
}

describe('Auth Service', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userModel: typeof mockUserModel;
  const createAuthDto: CreateAuthDto = {
    email: 'alex@email',
    password: '123456'
  }
  const userMock = {
    _id: '1',
    name: 'Alex',
    email: 'alex@email',
    cpf: '12345678909',
    phone: '123456789',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeAll(async () => {
    const authModuleTest:TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel
        }
      ]
    }).compile();

    authService = authModuleTest.get<AuthService>(AuthService);
    userModel = authModuleTest.get(getModelToken(User.name));
    jwtService = authModuleTest.get<JwtService>(JwtService);
  })

  afterEach(() => {
    jest.clearAllMocks();
  })

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(userModel).toBeDefined();
  })

  describe('Login Method', () => {
    it('should login a user', async () => {
      userModel.findOne.mockResolvedValue({...userMock, password: 'hashedPassword'})
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');

      const result = await authService.login(createAuthDto); 

      expect(userModel.findOne).toHaveBeenCalledTimes(1)
      expect(userModel.findOne).toHaveBeenCalledWith({ email: createAuthDto.email })

      expect(bcrypt.compare).toHaveBeenCalledTimes(1)
      expect(bcrypt.compare).toHaveBeenCalledWith(createAuthDto.password, 'hashedPassword')

      expect(jwtService.signAsync).toHaveBeenCalledTimes(1)
      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: userMock._id, username: userMock.name })

      expect(result).toEqual({
        token: expect.any(String)
      })
    })

    it('should throw an error if user email not found', async () => {
      userModel.findOne.mockResolvedValue(null);

      await expect(authService.login(createAuthDto)).rejects.toThrow(BadRequestException)

      expect(userModel.findOne).toHaveBeenCalledTimes(1)
      expect(userModel.findOne).toHaveBeenCalledWith({ email: createAuthDto.email })
    })

    it('should throw an error if password is incorrect', async () => {
      userModel.findOne.mockResolvedValue({...userMock, password: 'hashedPassword'})
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(authService.login(createAuthDto)).rejects.toThrow(BadRequestException)

      expect(userModel.findOne).toHaveBeenCalledTimes(1)
      expect(userModel.findOne).toHaveBeenCalledWith({ email: createAuthDto.email })

      expect(bcrypt.compare).toHaveBeenCalledTimes(1)
      expect(bcrypt.compare).toHaveBeenCalledWith(createAuthDto.password, 'hashedPassword')
    })

    it('should throw an error if token is not generated', async () => {
      userModel.findOne.mockResolvedValue({...userMock, password: 'hashedPassword'})
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(jwtService, 'signAsync').mockRejectedValue(new Error('Token Error'));

      await expect(authService.login(createAuthDto)).rejects.toThrow(InternalServerErrorException)

      expect(userModel.findOne).toHaveBeenCalledTimes(1)
      expect(userModel.findOne).toHaveBeenCalledWith({ email: createAuthDto.email })

      expect(bcrypt.compare).toHaveBeenCalledTimes(1)
      expect(bcrypt.compare).toHaveBeenCalledWith(createAuthDto.password, 'hashedPassword')

      expect(jwtService.signAsync).toHaveBeenCalledTimes(1)
      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: userMock._id, username: userMock.name })
    })
  })
})