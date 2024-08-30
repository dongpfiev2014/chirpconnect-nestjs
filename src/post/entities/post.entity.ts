import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType('Post')
@Entity('Post')
export class Post {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn('uuid')
  PostId: string;

  @Field()
  @Column({ type: 'nvarchar', length: 255, nullable: false })
  Content: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.Posts, { nullable: false })
  @JoinColumn({ name: 'PostedBy' })
  PostedBy: User;

  @Field()
  @Column({ type: 'bit', default: false })
  Pinned: boolean;

  @Field(() => [User])
  @ManyToMany(() => User, (user) => user.LikedPosts)
  LikedBy: User[];

  @Field()
  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  UpdatedAt: Date;
}
