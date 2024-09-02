import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../token-payload.interface';
import {
  Injectable,
  // UnauthorizedException
} from '@nestjs/common';
// import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UserService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies.Authentication,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  async validate(payload: TokenPayload) {
    // const { UserId } = payload;
    // const user: User = await this.userService.findOne(UserId);
    // if (!user) {
    //   throw new UnauthorizedException();
    // }
    // return {
    //   UserId: user.UserId,
    //   Email: user.Email,
    //   Username: user.Username,
    //   FirstName: user.FirstName,
    //   LastName: user.LastName,
    //   ProfilePic: user.ProfilePic,
    //   CreatedAt: user.CreatedAt,
    //   UpdatedAt: user.UpdatedAt,
    //   Followers: user.Followers,
    //   Following: user.Following,
    // };

    return payload;
  }
}
