import { Resolver, Args, Context, Query, Mutation, Int } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UserModel } from '../user/user.model';
import { AuthenticationModel } from './auth.model';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService
  ) {}

  @Mutation(() => AuthenticationModel)
  async authRegister(
    @Args('email'    , { type : () => String }) email     : string,
    @Args('nonce'    , { type : () => Int    }) nonce     : number,
    @Args('pubkey'   , { type : () => String }) pubkey    : string,
    @Args('signature', { type : () => String }) signature : string
  ): Promise<AuthenticationModel> {
    const user = await this.authService.register(email, nonce, pubkey, signature);
    const auth = new AuthenticationModel();
    auth.user        = user;
    auth.accessToken = await this.authService.buildAccessToken(user);
    return auth;
  }

  @Mutation(() => AuthenticationModel)
  async authLogin(
    @Args('email'    , { type : () => String }) email     : string,
    @Args('nonce'    , { type : () => Int    }) nonce     : number,
    @Args('signature', { type : () => String }) signature : string
  ): Promise<AuthenticationModel> {
    const user = await this.authService.login(email, nonce, signature);
    const auth = new AuthenticationModel();
    auth.user        = user;
    auth.accessToken = await this.authService.buildAccessToken(user);
    return auth;
  }

  // Smart stuff already checked in main.ts
  @Query(() => Boolean)
  async isAuthenticated(@Context() ctx): Promise<boolean> {
    return !!ctx.auth;
  }

}
