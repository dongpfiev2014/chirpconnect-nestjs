import { Injectable } from '@nestjs/common';
import { CreateNotificationInput } from './dto/create-notification.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { TokenPayload } from 'src/auth/token-payload.interface';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}
  async insertNotification(
    createNotificationInput: CreateNotificationInput,
  ): Promise<Notification> {
    try {
      // Create notification
      const data = {
        UserTo: { UserId: createNotificationInput.UserToId },
        UserFrom: { UserId: createNotificationInput.UserFromId },
        NotificationType: createNotificationInput.NotificationType,
        EntityId: createNotificationInput.EntityId,
      };

      // Delete existing notification with same parameters
      await this.notificationRepository.delete(data);

      // Create and save new notification
      const notification = this.notificationRepository.create(data);
      return await this.notificationRepository.save(notification);
    } catch (err) {
      console.error('Error inserting notification:', err);
      throw err;
    }
  }

  async findAll(user: TokenPayload, unreadOnly: boolean) {
    let whereOptions: any;
    whereOptions = {
      UserTo: { UserId: user.UserId },
      NotificationType: Not('newMessage'),
    };
    if (unreadOnly !== undefined && unreadOnly !== null && unreadOnly) {
      whereOptions = { ...whereOptions, Opened: false };
    }
    return await this.notificationRepository.find({
      where: whereOptions,
      relations: ['UserTo', 'UserFrom'],
      order: { CreatedAt: 'DESC' },
    });
  }

  async markAsOpened(user: TokenPayload, NotificationId: string) {
    const notification = await this.notificationRepository
      .createQueryBuilder()
      .update('notification')
      .set({ Opened: true })
      .where('NotificationId = :NotificationId', { NotificationId })
      .output('INSERTED.*')
      .execute();
    console.log(notification.raw[0]);
    return notification.raw[0];
  }

  async markAllAsOpened(user: TokenPayload): Promise<void> {
    const notification = await this.notificationRepository
      .createQueryBuilder()
      .update('notification')
      .set({ Opened: true })
      .where('UserTo = :UserTo', { UserTo: user.UserId })
      .execute();
    if (notification.affected === 1) return;
  }

  async getLatestNotification(user: TokenPayload) {
    return await this.notificationRepository.findOne({
      where: { UserTo: { UserId: user.UserId } },
      relations: ['UserTo', 'UserFrom'],
      order: { CreatedAt: 'DESC' },
    });
  }
}
