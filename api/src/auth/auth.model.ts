import { ObjectType, Field, Int } from '@nestjs/graphql';
import { database } from '@config';
import { User } from '../user/model/user';

import supercop from 'supercop';
import * as config from '@config';
import base64url from 'base64url';

@ObjectType('AuthenticationToken')
export class AuthenticationToken {
  constructor(user: User, expiry: number = 3600) {
    this.issuedAt  = Math.floor(Date.now() / 1000);
    this.expiresAt = this.issuedAt + expiry;
    this.user      = user;
  }

  @Field(() => User)
  user: User;

  @Field()
  accessToken: string;

  @Field(() => Int)
  issuedAt: number;

  @Field(() => Int)
  expiresAt: number;
}
