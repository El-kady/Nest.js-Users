import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { hash, compare } from 'bcrypt';

import { JwtService } from '@nestjs/jwt';

import { USER_NOT_FOUND, EMAIL_USER_CONFLICT, INVALID_CREDENTIALS } from '../../errors/errors.constants';

import { RegisterDto } from './dto/register-auth.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService) { }

  async register(registerDto: RegisterDto) {
    return this.userService.create(registerDto);
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(email: string, password: string){
    const user = await this.userService.findOne({ email });
    if (await compare(password, user.password)) {
      return user;
    }
    return null;
  }
}
