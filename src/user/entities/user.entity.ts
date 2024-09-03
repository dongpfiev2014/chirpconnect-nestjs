import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Post } from 'src/post/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType('User')
@Entity('User')
@Unique(['Username', 'Email'])
export class User {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn('uuid')
  @Index()
  UserId: string;

  @Field()
  @Column({ type: 'nvarchar', length: 255, nullable: false })
  FirstName: string;

  @Field()
  @Column({ type: 'nvarchar', length: 255, nullable: false })
  LastName: string;

  @Field()
  @Column({ type: 'nvarchar', length: 255, nullable: false, unique: true })
  Username: string;

  @Field()
  @Column({ type: 'nvarchar', length: 255, nullable: false, unique: true })
  Email: string;

  @Column({ type: 'nvarchar', length: 255, nullable: false })
  Password: string;

  @Field({
    defaultValue:
      'https://res.cloudinary.com/dq4kbmkrf/image/upload/v1724569868/images/profilePic.png',
  })
  @Column({
    type: 'nvarchar',
    length: 255,
    default:
      'https://res.cloudinary.com/dq4kbmkrf/image/upload/v1724569868/images/profilePic.png',
  })
  ProfilePic: string;

  @Field({
    nullable: true,
    defaultValue:
      'https://res.cloudinary.com/dq4kbmkrf/image/upload/v1725403871/images/cat.jpg',
  })
  @Column({
    type: 'nvarchar',
    length: 255,
    nullable: true,
    default:
      'https://res.cloudinary.com/dq4kbmkrf/image/upload/v1725403871/images/cat.jpg',
  })
  CoverPhoto: string;

  @Field(() => [Post])
  @OneToMany(() => Post, (post) => post.PostedBy)
  Posts: Post[];

  @Field(() => [Post])
  @ManyToMany(() => Post, (post) => post.LikedBy)
  @JoinTable()
  LikedPosts: Post[];

  @Field(() => [Post])
  @ManyToMany(() => Post, (post) => post.RetweetUsers)
  @JoinTable()
  RetweetPosts: Post[];

  @Field(() => [User])
  @ManyToMany(() => User, (user) => user.Followers)
  @JoinTable({
    name: 'User_Following',
    joinColumn: { name: 'UserId', referencedColumnName: 'UserId' },
    inverseJoinColumn: { name: 'FollowingId', referencedColumnName: 'UserId' },
  })
  Following: User[];

  @Field(() => [User])
  @ManyToMany(() => User, (user) => user.Following)
  Followers: User[];

  @Field()
  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  UpdatedAt: Date;
}
