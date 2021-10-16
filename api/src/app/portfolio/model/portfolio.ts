// import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
// import { database } from '@config';

import { ObjectType, Field } from '@graphql';

import { User } from '../../user/model/user';

@ObjectType('Portfolio')
export class Portfolio {

  @Field(() => String)
  uuid: string;

  @Field(() => User, { nullable : false })
  user: User;

  @Field(() => String, { nullable : false })
  displayName: string;

  @Field(() => String, { nullable : false })
  provider: string;

  @Field(() => String, { nullable : false })
  credentials: string;

}

