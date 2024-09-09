import {
  Controller,
  Get,
  Param,
  Put,
  Query,
  Render,
  UseGuards,
} from '@nestjs/common';
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
  async fetchNotifications(
    @CurrentUser() user: TokenPayload,
    @Query('unreadOnly') UnreadOnly: string,
  ) {
    const unreadOnly = UnreadOnly === 'true';
    return this.notificationService.findAll(user, unreadOnly);
  }

  @Put('/api/:NotificationId/markAsOpened')
  async markAsOpened(
    @CurrentUser() user: TokenPayload,
    @Param('NotificationId') NotificationId: string,
  ) {
    return this.notificationService.markAsOpened(user, NotificationId);
  }

  @Put('/api/markAsOpened')
  async markAllAsOpened(@CurrentUser() user: TokenPayload) {
    return this.notificationService.markAllAsOpened(user);
  }

  @Get('/api/latest')
  async getLatestNotification(@CurrentUser() user: TokenPayload) {
    return this.notificationService.getLatestNotification(user);
  }
}
