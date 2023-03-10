import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { hash, compare } from 'bcrypt';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { USER_NOT_FOUND, EMAIL_USER_CONFLICT } from '../../errors/errors.constants';

import { User, UserDocument } from './entities/user.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async create(createUserDto: CreateUserDto) {
    const testUserByEmail = await this.findOne({ email: createUserDto.email }, false);
    if (testUserByEmail) {
      throw new ConflictException(EMAIL_USER_CONFLICT)
    }

    createUserDto.password = await hash(createUserDto.password, 10);

    return this.userModel.create(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(filters: object, exceptionOnError: boolean = true): Promise<User> {
    const user = await this.userModel.findOne(filters).exec();
    if (!user && exceptionOnError) {
      throw new NotFoundException(USER_NOT_FOUND);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }
    return user;
  }

  async remove(id: string) {
    return this.userModel.deleteOne({ _id: id })
  }
}
