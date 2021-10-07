import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { database } from '@config';

import { Portfolio } from '../../portfolio/model/portfolio';

@Entity('user')
@ObjectType('User')
export class User extends BaseEntity {

  @Field()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Field({ nullable : false })
  @Column({ nullable : false })
  email: string;

  @Field({ nullable : false })
  @Column({ nullable : false })
  pubkey: string;

  @Field({ nullable : true })
  @Column({ nullable : true })
  displayName?: string;

  @Field({ nullable : false })
  @Column({ nullable: false, default: 'EUR' })
  displayCurrency: string;

  @Field(() => [Portfolio])
  @OneToMany(() => Portfolio, portfolio => portfolio.user, { cascade : true })
  portfolio: Portfolio[];

}

