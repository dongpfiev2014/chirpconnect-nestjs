import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class DeleteResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}
