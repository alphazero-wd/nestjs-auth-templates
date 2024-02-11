import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsStrongPassword, Matches } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @Matches(/^[0-9a-zA-Z_]*$/)
  username: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;
}
