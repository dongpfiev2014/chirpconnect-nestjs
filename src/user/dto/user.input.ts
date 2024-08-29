import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, IsUUID, Length } from 'class-validator';

@InputType()
export class UserInput {
  @Field()
  @IsUUID()
  UserId: string;

  @Field()
  @Length(1, 32)
  @IsString()
  FirstName: string;

  @Field()
  @Length(1, 32)
  @IsString()
  LastName: string;

  @Field()
  @IsString()
  @Length(1, 32)
  Username: string;

  @Field()
  @IsEmail()
  @Length(1, 255)
  Email: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  ProfilePic?: string;

  @Field({ nullable: true })
  @IsOptional()
  CreatedAt?: Date;

  @Field({ nullable: true })
  @IsOptional()
  UpdatedAt?: Date;
}
