import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor (
    @InjectModel(User.name) private readonly userModel: Model<User>
  ){}

  async createUser(createUserDto: CreateUserDto) {
    try {
      const userIsExist = await this.userModel.findOne({ email: createUserDto.email })
      if (userIsExist) throw new BadRequestException('Usuário já existe')
      
      const createNewUser = await this.userModel.create(createUserDto)
      return createNewUser
    } catch (error) {
      console.error(error);
      if (error instanceof BadRequestException) throw error
      throw new InternalServerErrorException('Devido a um erro interno, não foi possível criar o usuário')
    }
  }

  async findAllUsers() {
    try {
      const findAllUsers = await this.userModel.find()
      return findAllUsers
    } catch (error) {
      console.error(error);
      if (error instanceof BadRequestException) throw error
      throw new InternalServerErrorException('Devido a um erro interno, não foi possível listar os usuários')
    }
  }

  async findOneUser(id: string) {
    try {
      const findOneUser = await this.userModel.findById(id)
      if (!findOneUser) throw new BadRequestException('Usuário não encontrado')

      return findOneUser
    } catch (error) {
      console.error(error);
      if (error instanceof BadRequestException) throw error
      throw new InternalServerErrorException('Devido a um erro interno, não foi possível listar o usuário')
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    try {
      const userIsExist = await this.userModel.findById(id)
      if (!userIsExist) throw new BadRequestException('Usuário não encontrado')

      const updateUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true })
      return updateUser
    } catch (error) {
      console.error(error);
      if (error instanceof BadRequestException) throw error
      throw new InternalServerErrorException('Devido a um erro interno, não foi possível atualizar o usuário')
    }
  }

  async remove(id: string) {
    try {
      const userIsExist = await this.userModel.findById(id)
      if (!userIsExist) throw new BadRequestException('Usuário não encontrado')

      await this.userModel.findByIdAndDelete(id)
      return 'Usuário removido com sucesso'
    } catch (error) {
      console.error(error);
      if (error instanceof BadRequestException) throw error
      throw new InternalServerErrorException('Devido a um erro interno, não foi possível remover o usuário')
    }
  }
}
