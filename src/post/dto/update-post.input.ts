import { CreatePostInput } from './create-post.input';
import { InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdatePostInput extends PartialType(CreatePostInput) {}
