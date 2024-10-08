import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType('Post')
@Entity('Post')
export class Post {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn('uuid')
  // @Index()   - Not necessary
  PostId: string;

  @Field({ defaultValue: '' })
  @Column({ type: 'nvarchar', length: 255, nullable: true, default: '' })
  // @Index()   - Not necessary
  Content: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  ContentNoDiacritics: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.Posts, { nullable: false })
  @JoinColumn({ name: 'PostedBy' })
  PostedBy: User;

  @Field()
  @Column({ type: 'bit', default: false })
  Pinned: boolean;

  @Field(() => [User], { defaultValue: [] })
  @ManyToMany(() => User, (user) => user.LikedPosts)
  LikedBy: User[];

  @Field(() => [User], { defaultValue: [] })
  @ManyToMany(() => User, (user) => user.RetweetPosts)
  RetweetUsers: User[];

  @Field(() => Post, { nullable: true, defaultValue: null })
  @ManyToOne(() => Post, (post) => post.RetweetedPosts, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn({ name: 'OriginalPost' })
  @Index()
  OriginalPost?: Post;

  @Field(() => [Post], { defaultValue: [] })
  @OneToMany(() => Post, (post) => post.OriginalPost)
  RetweetedPosts: Post[];

  @Field(() => Post, { nullable: true, defaultValue: null })
  @ManyToOne(() => Post, (post) => post.Replies, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn({ name: 'ReplyTo' })
  @Index()
  ReplyTo?: Post;

  @Field(() => [Post], { defaultValue: [] })
  @OneToMany(() => Post, (post) => post.ReplyTo)
  Replies: Post[];

  @Field()
  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  UpdatedAt: Date;
}
