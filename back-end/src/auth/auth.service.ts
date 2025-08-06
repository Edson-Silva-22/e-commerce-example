import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/entities/user.entity';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService
  ) {}

  async login(createAuthDto: CreateAuthDto) {
    try {
      const userIsExist = await this.userModel.findOne({ email: createAuthDto.email });
      if (!userIsExist) throw new BadRequestException('User not found')
      
      const passwordIsCorrect = await bcrypt.compare(createAuthDto.password, userIsExist.password);
      if (!passwordIsCorrect) throw new BadRequestException('Password incorrect')

      const payload = { sub: userIsExist._id, username: userIsExist.name };
      return {
        token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      console.error(error)
      if (error instanceof BadRequestException) throw error
      throw new BadRequestException('Internal server error. It was not possible to login.')
    }
  }

  async getAuthUser(userId: string) {
    try {
      const findUser = await this.userModel.findById(userId).select('-password');
      if (!findUser) throw new BadRequestException('User not found')
      
      return findUser
    } catch (error) {
      console.error(error)
      if (error  instanceof BadRequestException) throw error
      throw new InternalServerErrorException('Internal server error. It was not possible to get the user.')
    }
  }
}
