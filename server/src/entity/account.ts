import { ObjectType, Field, ID } from 'type-graphql';
import { AbstractEntity } from './abstract';

@ObjectType()
export class Account extends AbstractEntity {
  static idField = 'uuid';

  @Field(() => ID)
  uuid: string;

  @Field()
  email: string;

  @Field()
  pubkey: string;
}
