import { Resolver, Query, Args, ID, Context } from '@nestjs/graphql';
import { UserModel } from './user.model';
import { UserService } from './user.service';

@Resolver(of => UserModel)
export class UserResolver {
  constructor(
    private userService: UserService
  ) {}

  @Query(() => UserModel, { nullable : true })
  async currentUser(@Context() ctx): Promise<UserModel> {
    if (!ctx.auth) return null;
    if (!ctx.auth.sub) return null;
    return this.userService.get(ctx.auth.sub);
  }

  // @Query(() => [UserModel])
  // users(): Promise<UserModel[]> {
  //   return this.userService.find();
  // }

  // @Query(() => UserModel, {name : 'user', nullable : true})
  // user(@Args('uuid', {type : () => ID}) uuid: string) {
  //   return this.userService.get({ uuid });
  // }

}
