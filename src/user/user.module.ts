import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ProfileController } from './profile.controller';
import { ApolloClientModule } from 'src/apollo-client/apollo-client.module';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ApolloClientModule],
  providers: [UserResolver, UserService],
  controllers: [ProfileController, UserController],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
