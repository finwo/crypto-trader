import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { database } from '@config';

import { User } from '../../user/model/user';

@Entity('portfolio')
@ObjectType('Portfolio')
export class Portfolio extends BaseEntity {

  @Field()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Field(() => User)
  @ManyToOne(() => User)
  user: User;

  @Field()
  @Column({ nullable : false })
  displayName?: string;

  @Field()
  @Column({ nullable : false })
  provider: string;

  @Field()
  @Column({ nullable : false })
  credentials: string;

  @Field(() => Number, { nullable : false })
  value: number;

}

