import { ObjectType, Field } from 'type-graphql';
import { AbstractEntity } from './abstract';

@ObjectType()
export class Portfolio extends AbstractEntity {
  static idField = 'uuid';

  @Field()
  uuid: string;

  @Field()
  name: string;

}
