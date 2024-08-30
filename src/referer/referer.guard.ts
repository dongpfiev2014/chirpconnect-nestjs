import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RefererGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const referer = request.headers.referer;
    const allowedReferer = ['http://localhost:3000', 'https://localhost:3002'];

    if (referer && allowedReferer.includes(referer)) {
      return true;
    } else {
      return false;
    }
  }
}
