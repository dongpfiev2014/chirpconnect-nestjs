import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Chat } from 'src/chat/entities/chat.entity';
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
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType('Message')
@Entity('Message')
export class Message {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn('uuid')
  MessageId: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'Sender' })
  Sender: User;

  @Field({ nullable: false })
  @Column({ type: 'nvarchar', length: 'max', nullable: false })
  Content: string;

  @Field(() => Chat)
  @ManyToOne(() => Chat)
  @JoinColumn({ name: 'Chat' })
  Chat: Chat;

  @Field(() => [User])
  @ManyToMany(() => User)
  @JoinTable({
    name: 'Message_ReadBy',
    joinColumn: { name: 'MessageId', referencedColumnName: 'MessageId' },
    inverseJoinColumn: { name: 'UserId', referencedColumnName: 'UserId' },
  })
  ReadBy: User[];

  @Field()
  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  UpdatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  trimName() {
    if (this.Content) {
      this.Content = this.Content.trim();
    }
  }
}
