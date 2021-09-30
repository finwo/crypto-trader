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

  async get(identifier: string | Partial<Portfolio>): Promise<Portfolio> {
    if (!identifier) return null;
    let uuid: string = null;
    if ('string' === typeof identifier) {
      uuid = identifier;
    } else {
      uuid = identifier.uuid;
    }
    if (!uuid) {
      return null;
    }
    return this.repo.findOne({ uuid });
  }

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

  async remove(user: User, identifier: string | Partial<Portfolio>) {
    const portfolio = await this.get(identifier);
    portfolio.user  = await this.getUser(portfolio);
    if (user.uuid !== portfolio.user.uuid) return false;
    await portfolio.remove();
    return true;
  }

}
