import { Injectable } from '@nestjs/common';
import { CreateNotificationInput } from './dto/create-notification.input';
import { UpdateNotificationInput } from './dto/update-notification.input';
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

  async findAll(user: TokenPayload) {
    return await this.notificationRepository.find({
      where: {
        UserTo: { UserId: user.UserId },
        NotificationType: Not('newMessage'),
      },
      relations: ['UserTo', 'UserFrom'],
      order: { CreatedAt: 'DESC' },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, _updateNotificationInput: UpdateNotificationInput) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
