import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  async signUp(createUserInput: CreateUserInput): Promise<User> {
    const { FirstName, LastName, Username, Email, Password } = createUserInput;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);

    const newUser = this.userRepository.create({
      FirstName,
      LastName,
      Username,
      Email,
      Password: hashedPassword,
    });

    try {
      return await this.userRepository.save(newUser);
    } catch (error) {
      if (error.number === 2627) {
        throw new ConflictException('User already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(UserId: string): Promise<User> {
    let found: User;
    try {
      found = await this.userRepository.findOne({ where: { UserId } });
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
    Object.assign(existingUser, updateUserInput);

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
}
