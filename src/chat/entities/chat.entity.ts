import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Message } from 'src/message/entities/message.entity';
import { User } from 'src/user/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType('Chat')
@Entity('Chat')
export class Chat {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn('uuid')
  ChatId: string;

  @Field({ nullable: true })
  @Column({ type: 'nvarchar', length: 255, nullable: true })
  ChatName: string;

  @Field()
  @Column({ default: false })
  IsGroupChat: boolean;

  @Field(() => [User])
  @ManyToMany(() => User, { eager: true })
  @JoinTable({
    name: 'Chat_User',
    joinColumn: { name: 'ChatId', referencedColumnName: 'ChatId' },
    inverseJoinColumn: { name: 'UserId', referencedColumnName: 'UserId' },
  })
  Users: User[];

  @Field(() => Message, { nullable: true })
  @OneToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'LatestMessageId' })
  LatestMessage: Message;

  @Field()
  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  UpdatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  trimName() {
    if (this.ChatName) {
      this.ChatName = this.ChatName.trim();
    }
  }
}
