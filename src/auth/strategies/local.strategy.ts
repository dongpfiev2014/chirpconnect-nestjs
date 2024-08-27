import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserService } from 'src/user/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      usernameField: 'Email',
      passwordField: 'Password',
    });
  }

  async validate(Email: string, Password: string) {
    try {
      return await this.userService.verifyUser(Email, Password);
    } catch (err) {
      throw new UnauthorizedException('Invalid email or password');
    }
  }
}
