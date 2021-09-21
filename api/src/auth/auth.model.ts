import { ObjectType, Field } from '@nestjs/graphql';
import { database } from '@config';
import { UserModel } from '../user/user.model';

@ObjectType('Authentication')
export class AuthenticationModel {

  @Field(() => UserModel)
  user: UserModel;

  @Field()
  accessToken: string;
}
