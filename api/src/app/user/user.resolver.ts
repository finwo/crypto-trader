import { Service } from 'typedi';
import { Query, Mutation, Context, Auth, Arg } from '@graphql';

// import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { User } from './model/user';
import { UserService } from './user.service';

@Service()
export class UserResolver {
  constructor(
    private userService: UserService
  ) {}

  @Query(() => User, { nullable : true })
  async currentUser(@Auth() auth): Promise<User> {
    if (!auth) return null;
    if (!auth.sub) return null;
    return this.userService.get(auth.sub);
  }

  @Mutation(() => User, { nullable : true })
  async userUpdate(
    @Auth() auth,
  //   @Args('email'          , { type : () => String, nullable : true }) email?          : string,
  //   @Args('pubkey'         , { type : () => String, nullable : true }) pubkey?         : string,
  //   @Args('displayName'    , { type : () => String, nullable : true }) displayName?    : string,
    @Arg('displayCurrency', { type : () => String, nullable : true }) displayCurrency?: string,
  ): Promise<User> {
    if (!auth) return null;
    if (!auth.sub) return null;
    const data: Partial<User> = Object
      .entries({
  //       email,
  //       pubkey,
  //       displayName,
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
    return this.userService.update(auth.sub, data);
  }

}
