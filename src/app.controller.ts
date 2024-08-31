import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(JwtAuthGuard)
  @Get('HelloWorld')
  @CacheKey(`user_${123456}_HelloWorld_key`)
  @CacheTTL(60000)
  async getHello() {
    return this.appService.getHello();
  }
  @UseGuards(JwtAuthGuard)
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
