import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { compare, hash } from 'bcrypt';

import { USER_NOT_FOUND, EMAIL_USER_CONFLICT, INVALID_CREDENTIALS } from '../../errors/errors.constants';

import { User, UserDocument } from '../users/entities/user.entity';

import { RegisterDto } from './dto/register-auth.dto';
import { LoginDto } from './dto/login-auth.dto';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async register(registerDto: RegisterDto) {

    const testUserByEmail = await this.userModel.find({ email: registerDto.email }).exec();
    if (testUserByEmail.length > 0) {
      throw new ConflictException(EMAIL_USER_CONFLICT)
    }

    const password = await hash(registerDto.password, 10);

    const created = new this.userModel({
      username: registerDto.username,
      email: registerDto.email,
      password
    });

    return created.save();

  }

  async login(loginDto: LoginDto) {
    const user = await this.userModel.findOne({ email: loginDto.email }).exec();
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    if (!(await compare(loginDto.password, user.password))) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }


  }
}
