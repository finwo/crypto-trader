import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Portfolio } from './model/portfolio';
import { Repository } from "typeorm";

import { User } from '../user/model/user';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Portfolio) private repo: Repository<Portfolio>,
  ) {}

  async getUser(portfolio: Portfolio): Promise<User> {
    if (portfolio.user) return portfolio.user;
    return this.repo
      .createQueryBuilder()
      .relation(Portfolio, 'user')
      .of(portfolio)
      .loadOne()
  }

  async create(user: User, data: Partial<Portfolio>): Promise<Portfolio> {
    const portfolio = new Portfolio();
    const cloned    = Object.assign({}, data);
    delete cloned.uuid;
    Object.assign(portfolio, cloned);
    portfolio.user = user;
    await portfolio.save();
    return portfolio;
  }

}
