import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, MinLength } from 'class-validator';

@InputType()
export class CreatePostInput {
  @Field()
  @MinLength(1)
  @IsString()
  Content: string;

  @Field({
    defaultValue: false,
  })
  @IsOptional()
  Pinned?: boolean;
}
