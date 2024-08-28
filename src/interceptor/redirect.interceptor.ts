import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
// import { map } from 'rxjs/operators';

@Injectable()
export class RedirectInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      const response = context.switchToHttp().getResponse();

      if (request.jwtAuthError) {
        response.redirect('/auth/login');

        return throwError(() => new Error(request.jwtAuthError)); // NOTE:Ensure that the interceptor does not continue processing the request after the redirect
      }
    }
    return next.handle();
    // return next.handle().pipe(
    //   map((data) => {
    //     return data;
    //   }),
    // );
  }
}
