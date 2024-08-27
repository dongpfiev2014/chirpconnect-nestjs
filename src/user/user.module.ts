import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { ApolloClientModule } from 'src/apollo-client/apollo-client.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ApolloClientModule],
  providers: [UserResolver, UserService],
  controllers: [UserController],
})
export class UserModule {}
