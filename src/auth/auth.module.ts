import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
// import { SessionSerializer } from './session/session.serializer';
// import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow('JWT_EXPIRATION_TIME'),
        },
      }),
    }),
    // PassportModule.register({ session: true }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    // SessionSerializer
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
