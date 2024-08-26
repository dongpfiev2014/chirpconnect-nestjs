import { CreateUserInput } from './create-user.input';
import {
  InputType,
  // OmitType,
  PartialType,
} from '@nestjs/graphql';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}
// OmitType(CreateUserInput, ['Password'] as const),
