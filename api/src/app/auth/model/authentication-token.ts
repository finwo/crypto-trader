import { ObjectType, Field, Int } from '@graphql';
import { Repository } from '@db';

// import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, PrimaryColumn, ManyToOne } from 'typeorm';
// import { ObjectType, Field, Int } from '@nestjs/graphql';
import { auth } from '@config';
import { User } from '@app/user/model/user';
import { v4 as uuidv4 } from 'uuid';

import supercop from 'supercop';
import base64url from 'base64url';

// @Entity('authentication_token')
@ObjectType('Authentication')
export class AuthenticationToken {

  @Field(() => String)
  uuid: string;

  @Field(() => User)
  user: User;

  // Timestamp, when the access token expires
  @Field(() => Int)
  expiresAt: number;

  // Timestamp, when the refresh token expires
  @Field(() => Int)
  expires: number;

  @Field(() => String)
  accessToken: string;

  @Field(() => String)
  // @Column()
  refreshToken: string;

  static async init({ user, expires }: { user: User, expires?: number }): Promise<AuthenticationToken> {
    if (!user) {
      throw new Error("'user' required when creating authenticationtoken");
    }

    // Fetch repository
    const repo = new Repository<AuthenticationToken>(AuthenticationToken);

    // Calculate expiresAt
    expires = expires || auth.accessTokenExpiry;
    const now       = Math.floor(Date.now() / 1000);
    const expiresAt = now + expires;

    // Build message
    const header    = base64url.encode(JSON.stringify({typ: 'jct', alg: 'ed25519'}));
    const body      = base64url.encode(JSON.stringify({sub: user.uuid, iat: now, exp: expiresAt}));
    const signature = base64url.encode(await auth.kp.sign(`${header}.${body}`));

    // Build the actual token
    const token = new AuthenticationToken();
    Object.assign(token, {
      user,
      expiresAt,
      accessToken  : `${header}.${body}.${signature}`,
      refreshToken : uuidv4(),
      expires      : now + auth.refreshTokenExpiry,
    });

    // Store in DB and return
    await repo.save(token);
    return token;
  }

}