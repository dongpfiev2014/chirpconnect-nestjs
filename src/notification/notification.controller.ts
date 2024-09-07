import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TokenPayload } from 'src/auth/token-payload.interface';

@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  @Get('')
  @Render('notificationsPage')
  async root(@CurrentUser() user: TokenPayload) {
    return {
      pageTitle: 'Notifications',
      userLoggedIn: user,
      userLoggedInJs: JSON.stringify(user),
    };
  }
}
