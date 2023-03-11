import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';


describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([
              { username: 'Mostafa' },
            ]),
            create: jest
              .fn()
              .mockImplementation((createUserDto: CreateUserDto) => Promise.resolve(
                { _id: '123', ...createUserDto }
              )),
            findOne: jest.fn().mockImplementation((filters: User) => Promise.resolve({
              _id: filters._id,
              username: "Mostafa",
              email: "mostafa@yahoo.com",
              password: "1234"
            })),
            update: jest
            .fn()
            .mockImplementation((_id: string, updateUserDto: UpdateUserDto) =>
              Promise.resolve({ _id, ...updateUserDto }),
            ),
            remove: jest.fn().mockResolvedValue({ removed: true }),
          }
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    controller = module.get<UsersController>(UsersController);

  });

  describe('findAll', () => {
    it('should get an array of users', () => {
      expect(controller.findAll()).resolves.toEqual([
        {
          username: "Mostafa"
        }
      ]);
    });
  });

  describe('create', () => {
    it('should get the created user', () => {
      const user: CreateUserDto = {
        username: "Mostafa",
        email: "mostafa@yahoo.com",
        password: "1234"
      };
      expect(controller.create(user)).resolves.toEqual({
        _id: "123",
        ...user
      });
    });
  });

  describe('findOne', () => {
    it('should get a single user', () => {
      expect(controller.findOne('some_id')).resolves.toEqual({
        _id: 'some_id',
        username: "Mostafa",
        email: "mostafa@yahoo.com",
        password: "1234"
      });

    });
  });

  describe('update', () => {
    it('should update a user', () => {
      const userDTO: UpdateUserDto = {
        username: "Mostafa",
        email: "mostafa@yahoo.com",
        password: "1234"
      };
      expect(controller.update("some_id",userDTO)).resolves.toEqual({
        _id: 'some_id',
        ...userDTO,
      });
    });
  });


  describe('remove', () => {
    it('should return that it deleted a user', () => {
      expect(controller.remove('some_id')).resolves.toEqual({
        removed: true,
      });
    });
  });

});
