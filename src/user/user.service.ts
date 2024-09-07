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
import { S3Service } from 'src/common/s3/s3.service';
import {
  USER_UPLOAD_REGION,
  USERS_BUCKET,
  USERS_IMAGE_FILE_EXTENSION,
} from './user.constants';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectEntityManager() private entityManager: EntityManager,
    private readonly notificationService: NotificationService,
    private authService: AuthService,
    private readonly s3Service: S3Service,
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

  async findAllUserWithRedis(): Promise<User[]> {
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

  async findAll(search?: string): Promise<User[]> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (!search) {
      return queryBuilder.getMany();
    } else {
      const searchFullText = this.removeDiacritics(search);
      console.log(searchFullText, search);
      return queryBuilder
        .leftJoinAndSelect('user.Following', 'Following')
        .leftJoinAndSelect('user.Followers', 'Followers')
        .where(
          `(user.FirstName + ' ' + user.LastName) LIKE :searchFullText OR user.Username LIKE :searchFullText OR
           (user.FirstName + ' ' + user.LastName) LIKE :search OR user.Username LIKE :search
          `,
          {
            searchFullText: `%${searchFullText}%`,
            search: `%${search}%`,
          },
        )
        .getMany();
    }
  }

  removeDiacritics(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
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
        await this.notificationService.insertNotification({
          UserToId: ProfileId,
          UserFromId: UserId,
          NotificationType: 'follow',
          EntityId: UserId,
        });
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

  async uploadImage(file: Buffer, UserId: string, response: Response) {
    const timestamp = new Date().toISOString();
    const bucket = USERS_BUCKET;
    const key = `avatar-${UserId}-${timestamp}.${USERS_IMAGE_FILE_EXTENSION}`;
    const region = USER_UPLOAD_REGION;

    await this.s3Service.upload({
      bucket,
      key,
      file,
    });
    const ProfilePic = this.s3Service.getObjectUrl(bucket, key, region);
    const result = await this.userRepository
      .createQueryBuilder()
      .update('user')
      .set({ ProfilePic })
      .where('UserId = :UserId', { UserId })
      // .output('INSERTED.UserId, INSERTED.Username, INSERTED.ProfilePic')
      .output('INSERTED.*')
      .execute();

    const user = result.raw[0];
    this.authService.login(user, response);

    return {
      success: true,
      message: 'Photo changed successfully',
    };
  }

  async uploadCoverPhoto(file: Buffer, UserId: string) {
    const timestamp = new Date().toISOString();
    const bucket = USERS_BUCKET;
    const key = `coverphoto-${UserId}-${timestamp}.${USERS_IMAGE_FILE_EXTENSION}`;
    const region = USER_UPLOAD_REGION;

    await this.s3Service.upload({
      bucket,
      key,
      file,
    });
    const CoverPhoto = this.s3Service.getObjectUrl(bucket, key, region);
    await this.userRepository
      .createQueryBuilder()
      .update('user')
      .set({ CoverPhoto })
      .where('UserId = :UserId', { UserId })
      // .output('INSERTED.UserId, INSERTED.Username, INSERTED.ProfilePic')
      .execute();

    return {
      success: true,
      message: 'Photo changed successfully',
    };
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
