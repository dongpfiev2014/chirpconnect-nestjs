import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: any, done: (err: Error, user: User) => void) {
    done(null, user);
  }
  deserializeUser(payload: any, done: (err: Error, payload: any) => void) {
    done(null, payload);
  }
}
