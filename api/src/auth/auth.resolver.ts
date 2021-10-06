import { Resolver, Args, Context, Query, Mutation, Int } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { AuthenticationToken } from './model/authentication-token';
import { User } from '../user/model/user';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  // TODO: decide whether to keep content here or if it should move to the auth service
  @Mutation(() => AuthenticationToken, { nullable : true })
  async authRefresh(
    @Context() ctx,
    @Args('refreshToken', { type : () => String }) refreshToken : string
  ): Promise<AuthenticationToken> {
    let user: User;
    let oldToken: AuthenticationToken;

    // Fetch user from ctx
    if (ctx.auth && ctx.auth.sub) {
      user = await this.userService.get(ctx.auth.sub);
    }

    // Use old authentication token to fetch user
    oldToken = await AuthenticationToken.findOne({ refreshToken });
    if ((!user) && oldToken) {
      user = await this.authService.getUser(oldToken);
    }

    // No user = both accessToken & refreshToken are bad
    if (!user) {
      throw new Error("Invalid token");
    }

    // Invalidate old token (single-use only)
    if (oldToken) {
      await oldToken.remove();
    }

    // Generate & return new token
    return AuthenticationToken.init({ user });
  }

  @Mutation(() => AuthenticationToken)
  async authRegister(
    @Args('email'    , { type : () => String }) email     : string,
    @Args('nonce'    , { type : () => Int    }) nonce     : number,
    @Args('pubkey'   , { type : () => String }) pubkey    : string,
    @Args('signature', { type : () => String }) signature : string
  ): Promise<AuthenticationToken> {
    const user = await this.authService.register(email, nonce, pubkey, signature);
    return AuthenticationToken.init({ user });
  }

  @Mutation(() => AuthenticationToken, { nullable : true })
  async authLogin(
    @Args('email'    , { type : () => String }) email     : string,
    @Args('nonce'    , { type : () => Int    }) nonce     : number,
    @Args('signature', { type : () => String }) signature : string
  ): Promise<AuthenticationToken> {
    const user = await this.authService.login(email, nonce, signature);
    return AuthenticationToken.init({ user });
  }

  // @Mutation(() => AuthenticationToken)
  // async authUpdatePassword(
  //   @Args('email'    , { type : () => String }) email     : string,
  //   @Args('nonce'    , { type : () => Int    }) nonce     : number,
  //   @Args('pubkey'   , { type : () => String }) pubkey    : string,
  //   @Args('signature', { type : () => String }) signature : string
  // ): Promise<AuthenticationToken> {
  //   const user = await this.authService.register(email, nonce, pubkey, signature);
  //   return AuthenticationToken.init({ user });
  // }

  // Smart stuff already checked in main.ts
  @Query(() => Boolean)
  async isAuthenticated(@Context() ctx): Promise<boolean> {
    if (!ctx.auth) return false;
    if (!ctx.auth.sub) return false;
    return true;
  }

}
