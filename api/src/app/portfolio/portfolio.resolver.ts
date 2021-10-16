import { Service } from 'typedi';
import { Auth, Query, Resolver } from '@graphql';

import { PortfolioService } from './portfolio.service';
import { UserService } from '../user/user.service';

import { Portfolio } from './model/portfolio';
import { User } from '../user/model/user';

@Service()
@Resolver(Portfolio)
export class PortfolioResolver {
  constructor(
    private userService: UserService,
    private portfolioService: PortfolioService
  ) {}

  // @ResolveField()
  // async user(
  //   // @Context() ctx, @Parent() portfolio: Portfolio
  // ): Promise<User> {
// //     if (!ctx.auth) return null;
// //     if (!ctx.auth.sub) return null;
// //     const user  = await this.userService.get(ctx.auth.sub);
// //     if (!user) return null;
// //     const found = await this.portfolioService.getUser(portfolio);
// //     if (user.uuid !== found.uuid) return null; // How did you get the portfolio uuid??
// //     return found;
  //   return null;
  // }

//   @ResolveField(() => Float, { nullable : false })
//   async value(@Context() ctx, @Parent() portfolio: Portfolio): Promise<number> {
//     return 0;
//   }

//   @Query(() => Portfolio, { nullable : true })
//   async portfolio(
//     @Context() ctx,
//     @Args('uuid', { type : () => ID, nullable : false }) uuid: string
//   ): Promise<Portfolio> {
//     return (await this.portfolios(ctx)).find(portfolio => portfolio.uuid == uuid) || null;
//   }

  @Query(() => [Portfolio], { nullable : true })
  async portfolios(@Auth() auth): Promise<Portfolio[]> {
    if (!auth) return null;
    if (!auth.sub) return null;
    const user = await this.userService.get(auth.sub);
    if (!user) return null;
    return this.portfolioService.getPortfolioForUser(user);
  }

//   @Mutation(() => Portfolio)
//   async addPortfolio(
//     @Context() ctx,
//     @Args('displayName', { type : () => String, nullable : false }) displayName: string,
//     @Args('provider'   , { type : () => String, nullable : false }) provider   : string,
//     @Args('credentials', { type : () => String, nullable : false }) credentials: string
//   ): Promise<Portfolio> {
//     if (!ctx.auth) return null;
//     if (!ctx.auth.sub) return null;
//     const user = await this.userService.get(ctx.auth.sub);
//     if (!user) return null;
//     return this.portfolioService.create(user, {
//       displayName,
//       provider,
//       credentials,
//     });
//   }

//   @Mutation(() => Boolean)
//   async removePortfolio(
//     @Context() ctx,
//     @Args('uuid', { type : () => ID, nullable : false }) uuid: string
//   ): Promise<boolean> {
//     if (!ctx.auth) return null;
//     if (!ctx.auth.sub) return null;
//     const user = await this.userService.get(ctx.auth.sub);
//     if (!user) return null;
//     return this.portfolioService.remove(user, uuid);
//   }

}
