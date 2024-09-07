import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType('Notification')
@Entity('Notification')
export class Notification {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn('uuid')
  NotificationId: string;

  @Field(() => User)
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'UserToId' })
  UserTo: User;

  @Field(() => User)
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'UserFromId' })
  UserFrom: User;

  @Field()
  @Column({ type: 'nvarchar', length: 255, nullable: false })
  NotificationType: string;

  @Field()
  @Column({ type: 'uuid', nullable: false })
  EntityId: string;

  @Field({ defaultValue: false })
  @Column({ type: 'bit', default: false })
  Opened: boolean;

  @Field()
  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  UpdatedAt: Date;
}
