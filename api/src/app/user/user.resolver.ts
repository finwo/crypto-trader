import { Service } from 'typedi';
import { Query, Resolver, ResolveField, Mutation, Context, Auth, Arg, Parent } from '@graphql';
import { User } from './model/user';
import { Portfolio } from '../portfolio/model/portfolio';
import { UserService } from './user.service';
import { PortfolioService } from '../portfolio/portfolio.service';

@Resolver(User)
@Service()
export class UserResolver {
  constructor(
    private userService: UserService,
    private portfolioService: PortfolioService
  ) {}

  @ResolveField(() => [Portfolio], { nullable : true })
  async portfolio(@Parent() parent): Promise<Portfolio[]> {
    console.log('Calculated Field', {parent});
    return null;
  }

  @Query(() => User, { nullable : true })
  async currentUser(@Auth() auth): Promise<User> {
    if (!auth) return null;
    if (!auth.sub) return null;
    return this.userService.get(auth.sub);
  }

  @Mutation(() => User, { nullable : true })
  async userUpdate(
    @Auth() auth,
    @Arg('pubkey'         , { type : () => String, nullable : true }) pubkey?         : string,
    @Arg('displayCurrency', { type : () => String, nullable : true }) displayCurrency?: string,
  ): Promise<User> {
    if (!auth) return null;
    if (!auth.sub) return null;
    const data: Partial<User> = Object
      .entries({
        pubkey,
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
