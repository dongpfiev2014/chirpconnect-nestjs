import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TokenPayload } from 'src/auth/token-payload.interface';
import { NotificationService } from './notification.service';

@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @Get('')
  @Render('notificationsPage')
  async root(@CurrentUser() user: TokenPayload) {
    return {
      pageTitle: 'Notifications',
      userLoggedIn: user,
      userLoggedInJs: JSON.stringify(user),
    };
  }

  @Get('/api')
  async fetchNotifications(@CurrentUser() user: TokenPayload) {
    return this.notificationService.findAll(user);
  }
}
