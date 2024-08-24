import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@ObjectType('User')
@Entity('User')
@Unique(['Username', 'Email'])
export class User {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn('uuid')
  UserId: string;

  @Field()
  @Column({ type: 'varchar', length: 255, nullable: false })
  FirstName: string;

  @Field()
  @Column({ type: 'varchar', length: 255, nullable: false })
  LastName: string;

  @Field()
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  Username: string;

  @Field()
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  Email: string;

  @Field()
  @Column({ type: 'varchar', length: 255, nullable: false })
  Password: string;

  @Field({ defaultValue: '' })
  @Column({ type: 'varchar', length: 255, default: '' })
  ProfilePic: string;
}
