import { Resolver, Args, Context, Query, Mutation, Int } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthenticationToken } from './auth.model';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService
  ) {}

  @Mutation(() => AuthenticationToken)
  async authRegister(
    @Args('email'    , { type : () => String }) email     : string,
    @Args('nonce'    , { type : () => Int    }) nonce     : number,
    @Args('pubkey'   , { type : () => String }) pubkey    : string,
    @Args('signature', { type : () => String }) signature : string
  ): Promise<AuthenticationToken> {
    const user = await this.authService.register(email, nonce, pubkey, signature);
    const auth = new AuthenticationToken(user);
    auth.accessToken = await this.authService.buildAccessToken(auth);
    return auth;
  }

  @Mutation(() => AuthenticationToken)
  async authLogin(
    @Args('email'    , { type : () => String }) email     : string,
    @Args('nonce'    , { type : () => Int    }) nonce     : number,
    @Args('signature', { type : () => String }) signature : string
  ): Promise<AuthenticationToken> {
    const user = await this.authService.verifyLogin(email, nonce, signature);
    const auth = new AuthenticationToken(user);
    auth.accessToken = await this.authService.buildAccessToken(auth);
    return auth;
  }

  // Smart stuff already checked in main.ts
  @Query(() => Boolean)
  async isAuthenticated(@Context() ctx): Promise<boolean> {
    return !!ctx.auth;
  }

  @Mutation(() => AuthenticationToken)
  async authUpdatePassword(
    @Args('email'    , { type : () => String }) email     : string,
    @Args('nonce'    , { type : () => Int    }) nonce     : number,
    @Args('pubkey'   , { type : () => String }) pubkey    : string,
    @Args('signature', { type : () => String }) signature : string
  ): Promise<AuthenticationToken> {
    const user = await this.authService.register(email, nonce, pubkey, signature);
    const auth = new AuthenticationToken(user);
    auth.accessToken = await this.authService.buildAccessToken(auth);
    return auth;
  }

}
