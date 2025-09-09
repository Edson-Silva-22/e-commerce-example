import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor (
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const userIsExist = await this.userModel.findOne({
        $or: [
          { email: createUserDto.email },
          { cpf: createUserDto.cpf },
        ]
      });
      if (userIsExist) throw new BadRequestException('Email ou CPF já cadastrados.')

      const hashPassword = await bcrypt.hash(createUserDto.password, 10);
      createUserDto.password = hashPassword;
      
      const createNewUser = await this.userModel.create(createUserDto);
      const { password, ...user } = createNewUser.toObject()

      return user;
    } catch (error) {
      console.error(error)
      if (error instanceof BadRequestException) throw error
      throw new InternalServerErrorException('Erro Interno. Não foi possível criar o usuário.')
    }
  }

  async findAll() {
    try {
      const findAllUsers = await this.userModel.find().select("-password");
      return findAllUsers;
    } catch (error) {
      console.error(error)
      throw new InternalServerErrorException('Erro Interno. Não foi possível listar os usuários.')
    }
  }

  async findOne(id: string) {
    try {
      const findUser = await this.userModel.findById(id).select("-password");
      if (!findUser) throw new NotFoundException('Usuário não encontrado.')

      return findUser;
    } catch (error) {
      console.error(error)
      if (error instanceof NotFoundException) throw error
      throw new InternalServerErrorException('Erro Interno. Não foi possível encontrar o usuário.')
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      if (updateUserDto.password) {
        const hashPassword = await bcrypt.hash(updateUserDto.password, 10);
        updateUserDto.password = hashPassword;
      }

      const updateUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).select("-password");
      if (!updateUser) throw new NotFoundException('Usuário não encontrado.')

      return updateUser;
    } catch (error) {
      console.error(error)
      if (error instanceof NotFoundException) throw error
      throw new InternalServerErrorException('Erro Interno. Não foi possível atualizar o usuário.')
    }
  }

  async remove(id: string) {
    try {
      const deleteUser = await this.userModel.findByIdAndDelete(id);
      if (!deleteUser) throw new NotFoundException('Usuário não encontrado.')

      return "Usuário deletado com sucesso."
    } catch (error) {
      console.error(error)
      if (error instanceof NotFoundException) throw error
      throw new InternalServerErrorException('Erro Interno. Não foi possível deletar o usuário.')
    }
  }
}
