import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "../../users.controller";
import { UsersService } from "../../users.service";
import { CreateUserDto } from "../../dto/create-user.dto";
import { AuthGuard } from "../../../auth/auth.guard";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { UpdateUserDto } from "../../dto/update-user.dto";
import { validate } from "class-validator";
import { AuthUserType } from "src/utils/decorators/auth-user.decorator";

const mockUserService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}

describe('UsersController', () => {
  let userController: UsersController;
  let userService: UsersService;
  const userMock = {
    _id: '1',
    name: 'Alex',
    email: 'alex@email',
    cpf: '12345678909',
    phone: '123456789',
    createdAt: new Date(),
    updatedAt: new Date()
  }
  const authUser: AuthUserType = {
    sub: '1',
    username: 'Alex'
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

  beforeAll(async () => {
    const userModuleTest: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUserService,
        }
      ]
    })
      .overrideGuard(AuthGuard) // inicializando o guard
      .useValue({ 
        canActivate: jest.fn().mockReturnValue(true)
      }) // simula acesso autorizado no guard
      .compile();

    userController = userModuleTest.get<UsersController>(UsersController);
    userService = userModuleTest.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
    expect(userService).toBeDefined();
  })

  describe('Create Method', () => {
    it('should create a new user', async () => {
      (userService.create as jest.Mock).mockResolvedValue(createUserDto);

      const result = await userController.create(createUserDto);

      expect(userService.create).toHaveBeenCalledTimes(1)
      expect(userService.create).toHaveBeenCalledWith(createUserDto)
      expect(result).toEqual(createUserDto)
    })

    it('should throw errors on invalid DTO fields', async () => {
       const dto = new CreateUserDto(); // vazio, todos os campos inválidos

      const errors = await validate(dto);

      // Mapeia os erros como: { property: 'email', constraints: ['isNotEmpty', 'isEmail'] }
      const formattedErrors = errors.map(err => ({
        property: err.property,
        constraints: Object.keys(err.constraints ?? {})
      }));

      // Valida que todos esses campos possuem essas regras quebradas
      expect(formattedErrors).toEqual(expect.arrayContaining([
        { property: 'name', constraints: expect.arrayContaining(['isNotEmpty', 'isString']) },
        { property: 'email', constraints: expect.arrayContaining(['isNotEmpty', 'isEmail']) },
        { property: 'cpf', constraints: expect.arrayContaining(['isNotEmpty', 'isString']) },
        { property: 'password', constraints: expect.arrayContaining(['isNotEmpty', 'isString']) },
        { property: 'phone', constraints: expect.arrayContaining(['isNotEmpty', 'isString']) },
      ]));
    })

    it('should throw an error if user already exists', async () => {
      (userService.create as jest.Mock).mockRejectedValue(new BadRequestException('User already exists'));

      await expect(userController.create(createUserDto)).rejects.toThrow(BadRequestException);

      expect(userService.create).toHaveBeenCalledTimes(1)
      expect(userService.create).toHaveBeenCalledWith(createUserDto)
    })

    it('should handle internal server error', async () => {
      (userService.create as jest.Mock).mockRejectedValue(new InternalServerErrorException('Internal server error. It was not possible to create the user.'));

      await expect(userController.create(createUserDto)).rejects.toThrow(InternalServerErrorException);

      expect(userService.create).toHaveBeenCalledTimes(1)
      expect(userService.create).toHaveBeenCalledWith(createUserDto)
    })
  })

  describe('FindAll Method', () => {
    it('should return an array of users', async () => {
      (userService.findAll as jest.Mock).mockResolvedValue([userMock]);

      const result = await userController.findAll();

      expect(userService.findAll).toHaveBeenCalledTimes(1)
      expect(userService.findAll).toHaveBeenCalledWith()
      expect(result).toEqual([userMock])
    })

    it('should handle internal server error', async () => {
      (userService.findAll as jest.Mock).mockRejectedValue(new InternalServerErrorException('Internal server error. It was not possible to find the users.'))

      await expect(userController.findAll()).rejects.toThrow(InternalServerErrorException);

      expect(userService.findAll).toHaveBeenCalledTimes(1)
      expect(userService.findAll).toHaveBeenCalledWith()
    })
  })

  describe('FindOne Method', () => {
    it('should return a user', async () => {
      (userService.findOne as jest.Mock).mockResolvedValue(userMock);

      const result = await userController.findOne('userId');

      expect(userService.findOne).toHaveBeenCalledTimes(1)
      expect(userService.findOne).toHaveBeenCalledWith('userId')
      expect(result).toEqual(userMock)
    })

    it('should throw an error if user not found', async () => {
      (userService.findOne as jest.Mock).mockRejectedValue(new BadRequestException('User not found'))

      await expect(userController.findOne('userId')).rejects.toThrow(BadRequestException);

      expect(userService.findOne).toHaveBeenCalledTimes(1)
      expect(userService.findOne).toHaveBeenCalledWith('userId')
    })

    it('should handle internal server error', async () => {
      (userService.findOne as jest.Mock).mockRejectedValue(new InternalServerErrorException('Internal server error. It was not possible to find the user.'))

      await expect(userController.findOne('userId')).rejects.toThrow(InternalServerErrorException)

      expect(userService.findOne).toHaveBeenCalledTimes(1)
      expect(userService.findOne).toHaveBeenCalledWith('userId')
    })
  })

  describe('Update Method', () => {
    it('should update a user', async () => {
      (userService.update as jest.Mock).mockResolvedValue(updateUserDto);

      const result = await userController.update('userId', updateUserDto);

      expect(userService.update).toHaveBeenCalledTimes(1)
      expect(userService.update).toHaveBeenCalledWith('userId', updateUserDto)
    })

    it('should throw an error if user not found', async () => {
      (userService.update as jest.Mock).mockRejectedValue(new BadRequestException('User not found'))

      await expect(userController.update('userId', updateUserDto)).rejects.toThrow(BadRequestException);

      expect(userService.update).toHaveBeenCalledTimes(1)
      expect(userService.update).toHaveBeenCalledWith('userId', updateUserDto)
    })

    it('should handle internal server error', async () => {
      (userService.update as jest.Mock).mockRejectedValue(new InternalServerErrorException('Internal server error. It was not possible to update the user.'))

      await expect(userController.update('userId', updateUserDto)).rejects.toThrow(InternalServerErrorException)

      expect(userService.update).toHaveBeenCalledTimes(1)
      expect(userService.update).toHaveBeenCalledWith('userId', updateUserDto)
    })
  })

  describe('Delete Method', () => {
    it('should delete a user', async () => {
      (userService.remove as jest.Mock).mockResolvedValue('User deleted successfully');

      const result = await userController.remove('userId');

      expect(userService.remove).toHaveBeenCalledTimes(1)
      expect(userService.remove).toHaveBeenCalledWith('userId')
      expect(result).toEqual('User deleted successfully')
    })

    it('should throw an error if user not found', async () => {
      (userService.remove as jest.Mock).mockRejectedValue(new BadRequestException('User not found'))

      await expect(userController.remove('userId')).rejects.toThrow(BadRequestException);

      expect(userService.remove).toHaveBeenCalledTimes(1)
      expect(userService.remove).toHaveBeenCalledWith('userId')
    })

    it('should handle internal server error', async () => {
      (userService.remove as jest.Mock).mockRejectedValue(new InternalServerErrorException('Internal server error. It was not possible to delete the user.'))

      await expect(userController.remove('userId')).rejects.toThrow(InternalServerErrorException)

      expect(userService.remove).toHaveBeenCalledTimes(1)
      expect(userService.remove).toHaveBeenCalledWith('userId')
    })
  })

  describe('Me Method', () => {
    it('should return a user', async () => {
      (userService.findOne as jest.Mock).mockResolvedValue({...userMock, password: 'hashedPassword'});

      const result = await userController.findOne(authUser.sub);

      expect(userService.findOne).toHaveBeenCalledTimes(1)
      expect(userService.findOne).toHaveBeenCalledWith(authUser.sub)
      expect(result).toEqual({...userMock, password: 'hashedPassword'})
    })

    it('should throw an error if user not found', async () => {
      (userService.findOne as jest.Mock).mockRejectedValue(new BadRequestException('User not found'))

      await expect(userController.findOne(authUser.sub)).rejects.toThrow(BadRequestException)

      expect(userService.findOne).toHaveBeenCalledTimes(1)
      expect(userService.findOne).toHaveBeenCalledWith(authUser.sub)
    })

    it('should handle internal server error', async () => {
      (userService.findOne as jest.Mock).mockRejectedValue(new InternalServerErrorException('Internal server error. It was not possible to get the user.'))

      await expect(userController.findOne(authUser.sub)).rejects.toThrow(InternalServerErrorException)

      expect(userService.findOne).toHaveBeenCalledTimes(1)
      expect(userService.findOne).toHaveBeenCalledWith(authUser.sub)
    })
  })

  describe('UpdateMe Method', () => {
    it('should update a user', async () => {
      (userService.update as jest.Mock).mockResolvedValue(updateUserDto);

      const result = await userController.updateMe(authUser, updateUserDto);

      expect(userService.update).toHaveBeenCalledTimes(1)
      expect(userService.update).toHaveBeenCalledWith(authUser.sub, updateUserDto)
      expect(result).toEqual(updateUserDto)
    })

    it('should throw an error if user not found', async () => {
      (userService.update as jest.Mock).mockRejectedValue(new BadRequestException('User not found'))

      await expect(userController.updateMe(authUser, updateUserDto)).rejects.toThrow(BadRequestException);

      expect(userService.update).toHaveBeenCalledTimes(1)
      expect(userService.update).toHaveBeenCalledWith(authUser.sub, updateUserDto)
    })

    it('should handle internal server error', async () => {
      (userService.update as jest.Mock).mockRejectedValue(new InternalServerErrorException('Internal server error. It was not possible to update the user.'))

      await expect(userController.updateMe(authUser, updateUserDto)).rejects.toThrow(InternalServerErrorException)

      expect(userService.update).toHaveBeenCalledTimes(1)
      expect(userService.update).toHaveBeenCalledWith(authUser.sub, updateUserDto)
    })
  })
})