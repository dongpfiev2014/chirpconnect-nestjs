import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class KeepAliveService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  onModuleInit() {
    setInterval(async () => {
      try {
        await this.userRepository.query('SELECT 1');
        console.log('Keep-alive query sent to database');
      } catch (error) {
        console.error('Error keeping the connection alive:', error);
      }
    }, 30000);
  }
}
