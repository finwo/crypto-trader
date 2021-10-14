import { Service, Inject } from 'typedi';
import { Context, Int, Arg, Query, Mutation } from '@graphql';

import { AuthService } from '@app/auth/auth.service';
import { UserService } from '@app/user/user.service';
import { AuthenticationToken } from './model/authentication-token';
// import { User } from '../user/model/user';

@Service()
export class AuthResolver {

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  // // TODO: decide whether to keep content here or if it should move to the auth service
  // @Mutation(() => AuthenticationToken, { nullable : true })
  // async authRefresh(
  //   ctx,
  //   req: Request
  // ): Promise<AuthenticationToken> {
  //   @Context() ctx,
  //   @Args('refreshToken', { type : () => String }) refreshToken : string
  //   let user: User;
  //   let oldToken: AuthenticationToken;

  //   // Fetch user from ctx
  //   if (ctx.auth && ctx.auth.sub) {
  //     user = await this.userService.get(ctx.auth.sub);
  //   }

  //   // Use old authentication token to fetch user
  //   oldToken = await AuthenticationToken.findOne({ refreshToken });
  //   if ((!user) && oldToken) {
  //     user = await this.authService.getUser(oldToken);
  //   }

  //   // No user = both accessToken & refreshToken are bad
  //   if (!user) {
  //     throw new Error("Invalid token");
  //   }

  //   // Invalidate old token (single-use only)
  //   if (oldToken) {
  //     await oldToken.remove();
  //   }

  //   // Generate & return new token
  //   return AuthenticationToken.init({ user });
  // }

  @Mutation(() => AuthenticationToken, { nullable : true })
  async authRegister(
    @Context() ctx,
    @Arg('email'    , { type : () => String }) email     : string,
    @Arg('nonce'    , { type : () => Int    }) nonce     : number,
    @Arg('pubkey'   , { type : () => String }) pubkey    : string,
    @Arg('signature', { type : () => String }) signature : string
  ): Promise<AuthenticationToken> {
    const user = await this.authService.register(email, nonce, pubkey, signature);
    return AuthenticationToken.init({ user });
  }

  @Mutation(() => AuthenticationToken, { nullable : true })
  async authLogin(
    @Arg('email'    , { type : () => String }) email     : string,
    @Arg('nonce'    , { type : () => Int    }) nonce     : number,
    @Arg('signature', { type : () => String }) signature : string
  ): Promise<AuthenticationToken> {
    const user = await this.authService.login(email, nonce, signature);
    return AuthenticationToken.init({ user });
  }

  // // @Mutation(() => AuthenticationToken)
  // // async authUpdatePassword(
  // //   @Args('email'    , { type : () => String }) email     : string,
  // //   @Args('nonce'    , { type : () => Int    }) nonce     : number,
  // //   @Args('pubkey'   , { type : () => String }) pubkey    : string,
  // //   @Args('signature', { type : () => String }) signature : string
  // // ): Promise<AuthenticationToken> {
  // //   const user = await this.authService.register(email, nonce, pubkey, signature);
  // //   return AuthenticationToken.init({ user });
  // // }

  // Smart stuff already checked in main.ts
  @Query(() => Boolean)
  async isAuthenticated(ctx): Promise<boolean> {
    if (!ctx.auth) return false;
    if (!ctx.auth.sub) return false;
    return true;
  }

}
