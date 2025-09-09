import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
      if (!userIsExist) throw new NotFoundException('Usuário não encontrado.')
      
      const passwordIsCorrect = await bcrypt.compare(createAuthDto.password, userIsExist.password);
      if (!passwordIsCorrect) throw new BadRequestException('Senha incorreta.')

      const payload = { sub: userIsExist._id, username: userIsExist.name };
      return {
        token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      console.error(error)
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error
      throw new InternalServerErrorException('Erro Interno. Não foi possível fazer o login.')
    }
  }
}
