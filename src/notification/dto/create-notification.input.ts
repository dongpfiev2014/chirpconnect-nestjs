import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateNotificationInput {
  @Field(() => ID)
  @IsUUID()
  UserToId: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  UserFromId?: string | null;

  @Field()
  @IsString()
  NotificationType: string;

  @Field(() => ID)
  @IsUUID()
  EntityId: string;
}
