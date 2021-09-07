import { Arg, Resolver, Query, Mutation, ObjectType, Field, Ctx } from 'type-graphql';
import { Service } from 'typedi';
import { Account } from '@entity/account';
import { AccountRepository } from '../repository/account';

@ObjectType()
class ConfigResponse {

  @Field()
  timestamp: number;

  @Field()
  isAuthenticated: boolean;

  constructor(@Ctx() ctx) {
    this.isAuthenticated = !!ctx.auth;
    this.timestamp       = Date.now();
  }
}

@Service()
@Resolver()
export class ConfigResolver {

  @Query(() => ConfigResponse)
  async config(@Ctx() ctx): Promise<ConfigResponse> {
    return new ConfigResponse(ctx);
  }

  // @Mutation(() => String)
  // async register(@Arg('email') email: string, @Arg('pubkey') pubkey: string, @Arg('signature') signature: string): Promise<string> {
  //   return 'Hello World';
  // }

}
