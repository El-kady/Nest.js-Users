import { getModelToken } from '@nestjs/mongoose';
import { Model, Query, Types } from "mongoose";
import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { User, UserDocument } from './entities/user.entity';
import { UsersService } from './users.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EMAIL_USER_CONFLICT, USER_NOT_FOUND } from '../../errors/errors.constants';

const mockUser = (
  _id: Types.ObjectId = new Types.ObjectId("640b1f8801027004c3b203e6"),
  username = 'Kady',
  email = 'Kady@gmail.com',
  password = "123"
): User => ({
  _id,
  username,
  email,
  password
});

const mockUserDoc = (mock?: Partial<User>): Partial<UserDocument> => ({
  _id: mock?._id || new Types.ObjectId("640b1f8801027004c3b203e6"),
  username: mock?.username || 'Kady',
  email: mock?.email || "Kady@gmail.com",
  password: mock?.password || '123',
});

const userArray = [
  mockUser(),
  mockUser(new Types.ObjectId("640b1f8801027004c3b203e6"), 'Mostafa', 'mostafa@gmail.com', "123"),
];

const userDocArray = [
  mockUserDoc(),
  mockUserDoc({ _id: new Types.ObjectId("640b1f8801027004c3b203e6"), username: 'Mostafa', email: "mostafa@gmail.com", password: '123' }),
];

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken('User'),
          useValue: {
            new: jest.fn().mockResolvedValue(mockUser()),
            constructor: jest.fn().mockResolvedValue(mockUser()),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
            exec: jest.fn(),
          },
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<UserDocument>>(getModelToken('User'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it('should return all users', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(userDocArray),
      } as any);
      const users = await service.findAll();
      expect(users).toEqual(userArray);
    });
  })

  describe("create", () => {
    it('should create a new user if email is not exists', async () => {
      jest.spyOn(model, 'findOne').mockReturnValueOnce(
        createMock<Query<UserDocument, UserDocument>>({
          exec: jest.fn().mockResolvedValueOnce(null),
        }) as any,
      );

      jest.spyOn(model, 'create').mockImplementationOnce(() =>
        Promise.resolve({
          _id: new Types.ObjectId("640b1f8801027004c3b203e6"),
          username: 'Kady',
          email: "Kady@gmail.com",
          password: '123',
        }),
      );

      const newUser = await service.create({
        username: 'Kady',
        email: "Kady@gmail.com",
        password: '123',
      });
      expect(newUser).toEqual(mockUser(new Types.ObjectId("640b1f8801027004c3b203e6"), 'Kady', "Kady@gmail.com"));
    });

    it('should not create a new user if email is exists', async () => {
      const user = {
        _id: new Types.ObjectId("640b1f8801027004c3b203e6"),
        username: 'Kady',
        email: "Kady@gmail.com",
        password: '123',
      };
      jest.spyOn(model, 'findOne').mockReturnValueOnce(
        createMock<Query<UserDocument, UserDocument>>({
          exec: jest.fn().mockResolvedValueOnce(user),
        }) as any,
      );

      jest.spyOn(model, 'create').mockImplementationOnce(() =>
        Promise.resolve(user),
      );

      await expect(service.create({
        username: 'Kady',
        email: "Kady@gmail.com",
        password: '123',
      })).rejects.toEqual(
        new ConflictException(EMAIL_USER_CONFLICT),
      );
    });
  });

  describe("findOne", () => {
    it('should return the user if exists', async () => {

      const user = {
        _id: new Types.ObjectId("640b1f8801027004c3b203e6"),
        username: 'Kady',
        email: "Kady@gmail.com",
        password: '123',
      };

      jest.spyOn(model, 'findOne').mockReturnValueOnce(
        createMock<Query<UserDocument, UserDocument>>({
          exec: jest.fn().mockResolvedValueOnce(user),
        }) as any,
      );

      const newUser = await service.findOne({ email: "Kady@gmail.com" });

      expect(newUser).toHaveProperty("_id", user._id);
    });

    it('should return the right exception if the user if not exists if the flag is true', async () => {

      const user = null;

      jest.spyOn(model, 'findOne').mockReturnValueOnce(
        createMock<Query<UserDocument, UserDocument>>({
          exec: jest.fn().mockResolvedValueOnce(user),
        }) as any,
      );

      await expect(service.findOne({ email: "Kady@gmail.com" })).rejects.toEqual(
        new NotFoundException(USER_NOT_FOUND),
      );

    });

    it('should return null if the user if not exists if the flag is false', async () => {
      jest.spyOn(model, 'findOne').mockReturnValueOnce(
        createMock<Query<UserDocument, UserDocument>>({
          exec: jest.fn().mockResolvedValueOnce(null),
        }) as any,
      );

      const user = await service.findOne({ email: "Kady@gmail.com" }, false);
      expect(user).toEqual(null);
    });
  });


});
