import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateChatInput {
  @Field({ nullable: false })
  @IsUUID()
  UserId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  Username?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  ProfilePic?: string;
}
