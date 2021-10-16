import { Service } from 'typedi';
import { Context, Int, Arg, Query, Mutation, Auth } from '@graphql';
import { Repository } from '@db';

import { AuthService } from '@app/auth/auth.service';
import { UserService } from '@app/user/user.service';
import { AuthenticationToken } from './model/authentication-token';
import { User } from '../user/model/user';

@Service()
export class AuthResolver {
  private repo: Repository<AuthenticationToken>

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {
    this.repo = new Repository(AuthenticationToken);
  }

  // TODO: decide whether to keep content here or if it should move to the auth service
  @Mutation(() => AuthenticationToken, { nullable : true })
  async authRefresh(
    @Auth() auth,
    @Arg('refreshToken', { type : () => String }) refreshToken : string,
  ): Promise<AuthenticationToken> {
    let user: User;
    let oldToken: AuthenticationToken;

    // Fetch user from ctx
    if (auth && auth.sub) {
      user = await this.userService.get(auth.sub);
    }

    // Use old authentication token to fetch user
    oldToken = await this.repo.findOne({ refreshToken });
    if ((!user) && oldToken) {
      user = await this.authService.getUser(oldToken);
    }

    // No user = both accessToken & refreshToken are bad
    if (!user) {
      throw new Error("Invalid token");
    }

    // Invalidate old token (single-use only)
    if (oldToken) {
      await this.repo.remove(oldToken.uuid);
    }

    // Generate & return new token
    return AuthenticationToken.init({ user });
  }

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
