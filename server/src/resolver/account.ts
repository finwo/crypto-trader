import { Resolver, Query } from 'type-graphql';
import { Service } from 'typedi';
import { Account } from '@entity/account';
import { AccountRepository } from '../repository/account';

@Service()
@Resolver(of => Account)
export class AccountResolver {

  constructor(
    private repo: AccountRepository
  ) {}

  @Query(() => [Account])
  async accounts(): Promise<Account[]> {
    const accs = await this.repo.find();
    return accs;
  }

}
