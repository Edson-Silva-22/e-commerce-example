import { Test, TestingModule } from "@nestjs/testing";
import { User } from "../../entities/user.entity";
import { UsersService } from "../../users.service";
import { getModelToken } from "@nestjs/mongoose";
import { CreateUserDto } from "../../dto/create-user.dto";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from "../../dto/update-user.dto";


const mockUserModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
}

describe('UsersService', () => {
  let service: UsersService;
  let userModel: typeof mockUserModel;
  const userMock = {
    _id: '1',
    name: 'Alex',
    email: 'alex@email',
    cpf: '12345678909',
    phone: '123456789',
    createdAt: new Date(),
    updatedAt: new Date()
  }
  const createUserDto: CreateUserDto = {
    name: 'Alex',
    email: 'alex@email',
    cpf: '12345678909',
    password: '123456',
    phone: '123456789'
  }
  const updateUserDto: UpdateUserDto = {
    name: 'Alex Silva',
    password: 'new password'
  }

  beforeAll( async () => {
    // Criar um módulo de teste isolado, simulando o ambiente real de injeção de dependências do NestJS
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        }
      ]
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Limpa qualquer chamada anterior aos métodos jest.fn() para garantir que os testes não interfiram entre si.
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create Method', () => {
    const hashedPassword = 'hashedPassword';

    it('should create a new user', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
      mockUserModel.create.mockResolvedValue({
        ...createUserDto, 
        password: hashedPassword,
        toObject: jest.fn().mockReturnValue({
          name: createUserDto.name,
          email: createUserDto.email,
          cpf: createUserDto.cpf,
          phone: createUserDto.phone,
        }),
      })

      const result = await service.create(createUserDto);

      expect(mockUserModel.findOne).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findOne).toHaveBeenCalledWith({  email: createUserDto.email, cpf: createUserDto.cpf})
      
      expect(mockUserModel.create).toHaveBeenCalledTimes(1)
      expect(mockUserModel.create).toHaveBeenCalledWith({...createUserDto, password: hashedPassword})

      expect(result).toEqual({
        name: createUserDto.name,
        email: createUserDto.email,
        cpf: createUserDto.cpf,
        phone: createUserDto.phone
      })
    })

    it('should throw an error if user already exists', async () => {
      mockUserModel.findOne.mockResolvedValue(createUserDto);

      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);

      expect(mockUserModel.findOne).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findOne).toHaveBeenCalledWith({  email: createUserDto.email, cpf: createUserDto.cpf })    
    })

    it('should handle internal server error', async () => {
      mockUserModel.findOne.mockRejectedValue(new Error('Internal server error'));

      await expect(service.create(createUserDto)).rejects.toThrow(InternalServerErrorException);

      expect(mockUserModel.findOne).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findOne).toHaveBeenCalledWith({  email: createUserDto.email, cpf: createUserDto.cpf })    
    })
  })

  describe('FindAll Method', () => {
    it('should return an array of users', async () => {
      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([userMock])
      });

      const result = await service.findAll();

      expect(mockUserModel.find).toHaveBeenCalledTimes(1)
      expect(mockUserModel.find).toHaveBeenCalledWith()
      expect(result).toEqual([userMock])
    })

    it('should handle internal server error', async () => {
      // O método mockImplementation() define como uma função mockada deve se comportar quando for chamada
      mockUserModel.find.mockImplementation(() => ({
        select: jest.fn().mockRejectedValue(new Error('Internal server error'))
      }));

      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);

      expect(mockUserModel.find).toHaveBeenCalledTimes(1)
      expect(mockUserModel.find).toHaveBeenCalledWith()
    })
  })

  describe('FindOne Method', () => {
    it('should return a user', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(userMock)
      });

      const result = await service.findOne('1');

      expect(mockUserModel.findById).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findById).toHaveBeenCalledWith('1')
      expect(result).toEqual(userMock)
    })

    it('should throw an error if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await expect(service.findOne("userId")).rejects.toThrow(BadRequestException);

      expect(mockUserModel.findById).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findById).toHaveBeenCalledWith('userId')
    })

    it('should handle internal server error', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('DB Error'))
      })

      await expect(service.findOne('userId')).rejects.toThrow(InternalServerErrorException)

      expect(mockUserModel.findById).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findById).toHaveBeenCalledWith('userId')
    })
  })

  describe('Update Method', () => {
    it('should update a user', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(updateUserDto)
      });

      const result = await service.update('1', updateUserDto);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('1', updateUserDto, { new: true })
      expect(result).toEqual(updateUserDto)
    })

    it('should throw an error if user not found', async () => {
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await expect(service.update('1', updateUserDto)).rejects.toThrow(BadRequestException);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('1', updateUserDto, { new: true })
    })

    it('should handle internal server error', async () => {
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('DB Error'))
      });

      await expect(service.update('1', updateUserDto)).rejects.toThrow(InternalServerErrorException)

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('1', updateUserDto, { new: true })
    })
  })

  describe('Delete Method', () => {
    it('should delete a user', async () => {
      mockUserModel.findByIdAndDelete.mockResolvedValue(userMock);

      const result = await service.remove('1');

      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith('1')
      expect(result).toEqual('User deleted successfully')
    })

    it('should throw an error if user not found', async () => {
      mockUserModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.remove('userId')).rejects.toThrow(BadRequestException)

      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith('userId')
    })

    it('should handle internal server error', async () => {
      mockUserModel.findByIdAndDelete.mockRejectedValue(new Error('DB Error'))

      await expect(service.remove('userId')).rejects.toThrow(InternalServerErrorException)

      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith('userId')
    })
  })
})