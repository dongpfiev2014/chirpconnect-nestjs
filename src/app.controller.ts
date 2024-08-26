import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('HelloWorld')
  @CacheKey(`user_${123456}_HelloWorld_key`)
  @CacheTTL(60000)
  async getHello() {
    return this.appService.getHello();
  }

  @Get('')
  @Render('home.pug')
  root() {
    return {
      pageTitle: 'Chirp Connect',
    };
  }
}
