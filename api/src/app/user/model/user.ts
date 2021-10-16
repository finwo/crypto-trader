import { Service } from 'typedi';
import { ObjectType, Field } from '@graphql';

// import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
// import { ObjectType, Field } from '@nestjs/graphql';
// import { database } from '@config';

// import { Portfolio } from '../../portfolio/model/portfolio';

@Service()
@ObjectType('User')
export class User {

  @Field(() => String)
  // @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Field(() => String, { nullable : false })
  // @Column({ nullable : false })
  email: string;

  @Field(() => String, { nullable : false })
  // @Column({ nullable : false })
  pubkey: string;

  @Field(() => String, { nullable : true })
  displayCurrency?: string;

  // @Field(() => [Portfolio])
  // @OneToMany(() => Portfolio, portfolio => portfolio.user, { cascade : true })
  // portfolio: Portfolio[];

}

