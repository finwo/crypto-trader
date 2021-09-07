import { Resolver, Query } from 'type-graphql';
import { Service } from 'typedi';
import { Portfolio } from '../entity/portfolio';
import { PortfolioRepository } from '../repository/portfolio';

@Service()
@Resolver(of => Portfolio)
export class PortfolioResolver {

  constructor(
    private repo: PortfolioRepository
  ) {}

  @Query(() => [Portfolio])
  async portfolios(): Promise<Portfolio[]> {
    return this.repo.find();
  }

}
