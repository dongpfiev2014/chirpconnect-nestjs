import { IsString, IsUUID, MinLength } from 'class-validator';
import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class UpdateChatInput {
  @Field(() => ID)
  @IsUUID()
  ChatId: string;

  @Field()
  @IsString()
  @MinLength(1)
  ChatName: string;
}
