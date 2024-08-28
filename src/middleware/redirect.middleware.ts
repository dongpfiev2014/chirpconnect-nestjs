import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';

@Injectable()
// implements NestMiddleware
export class RedirectMiddleware {
  // use(req: any, res: any, next: (error?: Error | any) => void) {
  //   const { protocol, hostname, port } = req;
  //   console.log(protocol, hostname, port);
  //   if (req.path !== '/auth/login') {
  //     console.log('Redirecting to /auth/login');
  //     res.redirect('/auth/login');
  //   } else {
  //     next();
  //   }
  // }
}
