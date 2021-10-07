import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { User } from './model/user';
import { UserService } from './user.service';

@Resolver(of => User)
export class UserResolver {
  constructor(
    private userService: UserService
  ) {}

  @Query(() => User, { nullable : true })
  async currentUser(@Context() ctx): Promise<User> {
    if (!ctx.auth) return null;
    if (!ctx.auth.sub) return null;
    return this.userService.get(ctx.auth.sub);
  }

  @Mutation(() => User, { nullable : true })
  async userUpdate(
    @Context() ctx,
    @Args('email'          , { type : () => String, nullable : true }) email?          : string,
    @Args('pubkey'         , { type : () => String, nullable : true }) pubkey?         : string,
    @Args('displayName'    , { type : () => String, nullable : true }) displayName?    : string,
    @Args('displayCurrency', { type : () => String, nullable : true }) displayCurrency?: string,
  ) {
    if (!ctx.auth) return null;
    if (!ctx.auth.sub) return null;
    const data: Partial<User> = Object
      .entries({
        email,
        pubkey,
        displayName,
        displayCurrency,
      })
      .filter(([key, value]) => {
        if (undefined === value) return false;
        if (null === value) return false;
        return true;
      })
      .reduce((r,[k,v]) => {
        r[k] = v;
        return r;
      }, {});
    return this.userService.update(ctx.auth.sub, data);
  }

}
