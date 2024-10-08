import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
  Matches,
} from 'class-validator';

@InputType()
export class CreateUserInput {
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
  @Matches(/^\S*$/, { message: 'Username should not contain spaces' })
  Username: string;

  @Field()
  @IsEmail()
  @Length(1, 255)
  Email: string;

  @Field()
  @IsString()
  @Length(8, 32)
  @IsStrongPassword()
  Password: string;

  @Field({
    defaultValue:
      'https://res.cloudinary.com/dq4kbmkrf/image/upload/v1724569868/images/profilePic.png',
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  ProfilePic?: string;

  @Field({
    defaultValue:
      'https://res.cloudinary.com/dq4kbmkrf/image/upload/v1725403871/images/cat.jpg',
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  CoverPhoto?: string;
}
