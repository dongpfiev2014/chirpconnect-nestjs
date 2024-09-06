import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsUUID, MinLength } from 'class-validator';

@InputType()
export class CreateMessageInput {
  @Field(() => ID, { nullable: false })
  @IsUUID()
  ChatId: string;

  @Field(() => ID, { nullable: false })
  @IsUUID()
  Sender: string;

  @Field()
  @IsString()
  @MinLength(1)
  Content: string;
}
