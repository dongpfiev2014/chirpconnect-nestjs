import {
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserInput } from 'src/user/dto/create-user.input';
import { User } from 'src/user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get('login')
  @Render('login')
  loginPug() {
    return;
  }
  @Get('register')
  @Render('register')
  registerPug() {
    return;
  }

  @Post('register')
  @Render('register')
  async register(@Req() req: Request) {
    const payload = req.body as CreateUserInput;

    const FirstName = payload.FirstName.trim();
    const LastName = payload.LastName.trim();
    const Username = payload.Username.trim();
    const Email = payload.Email.trim();
    const Password = payload.Password;

    if (FirstName && LastName && Username && Email && Password) {
      try {
        const _newUser = await this.authService.register(payload);
        return { ...payload, successMessage: 'User registered successfully' };
      } catch (error) {
        return { ...payload, errorMessage: error.message };
      }
    } else {
      const errorMessage = 'Make sure each field has a valid value.';
      return { ...payload, errorMessage };
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    this.authService.logout(response);
  }
}
