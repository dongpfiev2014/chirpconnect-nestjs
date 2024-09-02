import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectEntityManager() private entityManager: EntityManager,
  ) {}

  private async hashedPassword(Password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(Password, salt);
  }

  async create(createUserInput: CreateUserInput): Promise<User> {
    try {
      const newUser = this.userRepository.create({
        ...createUserInput,
        Password: await this.hashedPassword(createUserInput.Password),
      });
      return await this.userRepository.save(newUser);
    } catch (error) {
      if (error.number === 2627) {
        throw new ConflictException('User already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async findAll(): Promise<User[]> {
    const users: User[] = await this.cacheManager.get(
      'AdminPermission-AllUsers',
    );
    if (users && users.length !== 0) {
      console.log('Users from cache');
      return users.map((user) => ({
        ...user,
        CreatedAt: new Date(user.CreatedAt),
        UpdatedAt: new Date(user.UpdatedAt),
      }));
    }
    const resultPromise = this.userRepository.find();

    resultPromise.then((result) => {
      this.cacheManager
        .set('AdminPermission-AllUsers', result, 10000)
        .then(() => {
          console.log('Users from Database');
        });
    });

    return resultPromise;

    // return this.userRepository.find();
  }

  async findOne(UserId: string): Promise<User> {
    let found: User;
    try {
      found = await this.userRepository.findOne({
        where: { UserId },
        relations: ['Posts', 'LikedPosts', 'Following', 'Followers'],
      });
      return found;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async update(
    UserId: string,
    updateUserInput: UpdateUserInput,
  ): Promise<User> {
    const existingUser = await this.findOne(UserId);
    Object.assign(existingUser, {
      ...updateUserInput,
      Password: updateUserInput.Password
        ? await this.hashedPassword(updateUserInput.Password)
        : existingUser.Password,
    });

    return this.userRepository.save(existingUser);
  }

  async remove(UserId: string): Promise<boolean> {
    const result = await this.userRepository.delete(UserId);
    console.log(result);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
    return true;
  }

  async verifyUser(Email: string, Password: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { Email } });
    const passwordIsValid = await bcrypt.compare(Password, user.Password);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Credentials are not valid');
    }
    return user;
  }

  async findProfile(Username: string): Promise<User> {
    let found: User;
    try {
      found = await this.userRepository.findOne({
        where: { Username },
        relations: ['Following', 'Followers'],
      });
      return found;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async followUser(ProfileId: string, UserId: string) {
    return this.entityManager.transaction(async (manager) => {
      const [targetUser, existingUser] = await Promise.all([
        manager.findOne(User, {
          where: { UserId: ProfileId },
        }),
        manager.findOne(User, {
          where: { UserId },
          relations: ['Following', 'Followers'],
        }),
      ]);
      if (!targetUser) {
        throw new NotFoundException('User not found');
      }
      const isFollowed = existingUser.Following.some(
        (follower) => follower.UserId === ProfileId,
      );

      if (!isFollowed) {
        existingUser.Following.push(targetUser);
      } else {
        existingUser.Following = existingUser.Following.filter(
          (follower) => follower.UserId !== ProfileId,
        );
      }
      await manager.save(existingUser);

      return existingUser;
    });
  }

  async renderFollowingUser(UserId: string) {
    const user = await this.userRepository.findOne({
      where: {
        UserId,
      },
      relations: ['Following'],
    });
    return user;
  }

  async renderFollowers(UserId: string) {
    const user = await this.userRepository.findOne({
      where: {
        UserId,
      },
      relations: ['Followers'],
    });
    return user;
  }

  async testRedis() {
    const test = await this.cacheManager.get('healthCheck');
    if (test) {
      return test;
    }
    this.cacheManager.set('healthCheck', `Hello World - From Redis`, 10000);
    return 'Hello World - From server';
  }
}
