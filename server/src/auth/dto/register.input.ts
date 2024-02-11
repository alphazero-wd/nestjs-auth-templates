import { InputType } from '@nestjs/graphql';
import { CreateUserInput } from '../../users/dto';

@InputType()
export class RegisterInput extends CreateUserInput {}
