import {
  Controller,
  Get,
  Render,
  Req,
  UseGuards,
  // UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import {} from // CacheInterceptor,
// CacheKey,
// CacheTTL,
'@nestjs/cache-manager';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller('')
@UseGuards(JwtAuthGuard)
// @UseInterceptors(CacheInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get('HelloWorld')
  // @CacheKey(`user_${123456}_HelloWorld_key`)
  // @CacheTTL(60000)
  // async getHello() {
  //   return this.appService.getHello();
  // }

  @Get('')
  @Render('home')
  root(@Req() req) {
    return {
      pageTitle: 'Home',
      userLoggedIn: req.user,
      userLoggedInJs: JSON.stringify(req.user),
    };
  }
}
