import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ProfileController } from './profile.controller';
import { ApolloClientModule } from 'src/apollo-client/apollo-client.module';
import { UserController } from './user.controller';
import { S3Module } from 'src/common/s3/s3.module';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ApolloClientModule,
    S3Module,
    NotificationModule,
    forwardRef(() => AuthModule),
  ],
  providers: [UserResolver, UserService],
  controllers: [ProfileController, UserController],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
