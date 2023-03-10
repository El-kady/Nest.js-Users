import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { USER_NOT_FOUND, EMAIL_USER_CONFLICT, INVALID_CREDENTIALS } from '../../errors/errors.constants';

import { RegisterDto } from './dto/register-auth.dto';
import { LoginDto } from './dto/login-auth.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService) { }

  async register(registerDto: RegisterDto) {
    return this.userService.create(registerDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    const payload = { username: user.username, sub: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
