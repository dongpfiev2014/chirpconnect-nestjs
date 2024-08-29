import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Post } from 'src/post/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
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
    type: 'varchar',
    length: 255,
    default:
      'https://res.cloudinary.com/dq4kbmkrf/image/upload/v1724569868/images/profilePic.png',
  })
  ProfilePic: string;

  @OneToMany(() => Post, (post) => post.PostedBy)
  Posts: Post[];

  @Field()
  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  UpdatedAt: Date;
}
