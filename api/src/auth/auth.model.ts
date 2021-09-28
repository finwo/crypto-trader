import { ObjectType, Field } from '@nestjs/graphql';
import { database } from '@config';
import { User } from '../user/model/user';

@ObjectType('Authentication')
export class AuthenticationModel {

  @Field(() => User)
  user: User;

  @Field()
  accessToken: string;
}
