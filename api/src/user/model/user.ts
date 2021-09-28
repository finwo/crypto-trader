import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { database } from '@config';

@Entity('user')
@ObjectType('User')
export class User extends BaseEntity {

  @Field()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Field()
  @Column({ nullable : false })
  email: string;

  @Field()
  @Column({ nullable : false })
  pubkey: string;

  @Field({ nullable : true })
  @Column({ nullable : true })
  displayName?: string;

}

