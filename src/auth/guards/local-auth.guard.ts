import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class LocalAuthGuard extends AuthGuard('local') {
  // Using Express-Session and caching with Redis  ----------------------------------------------------------------

  // async canActivate(context: ExecutionContext) {
  //   const result = (await super.canActivate(context)) as boolean;
  //   const request = context.switchToHttp().getRequest();
  //   await super.logIn(request);
  //   return result;
  // }

  // Using JWT credentials ----------------------------------------------------------------
  handleRequest(err, user, info, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    if (!user) {
      request.authError = 'Invalid email or password';
      return null;
    }

    return user;
  }
}
