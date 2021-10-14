// import { BaseEntity, Column, Entity, PrimaryColumn, ManyToOne } from 'typeorm';
// import { ObjectType, Field, Float } from '@nestjs/graphql';
// import { database } from '@config';

// import { User } from '../../user/model/user';

// @Entity('ticker')
// @ObjectType('Ticker')
// export class Ticker extends BaseEntity {


//   @Field()
//   @PrimaryColumn()
//   provider: string;

//   @Field()
//   @PrimaryColumn()
//   product: string;

//   @Field(() => Float)
//   @Column({ nullable : false, type : "double" })
//   price: number;

//   @Field(() => Float)
//   @Column({ nullable : false, type : "double" })
//   bid: number;

//   @Field(() => Float)
//   @Column({ nullable : false, type : "double" })
//   ask: number;

//   @Field(() => Float)
//   @Column({ nullable : false, type : "double" })
//   volume: number;

// }

