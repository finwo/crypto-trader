import { Service } from 'typedi';

// import { Injectable } from '@nestjs/common';
// import { Cron, Timeout } from '@nestjs/schedule';
// import { InjectRepository } from "@nestjs/typeorm";
// import { Portfolio } from './model/portfolio';
// import { Repository, MoreThan } from "typeorm";

import { User } from '../user/model/user';

// import { AbstractAdapter } from './adapter/abstract';
// import { CoinbaseAdapter } from './adapter/coinbase';

// @Injectable()
@Service()
export class PortfolioService {
  constructor(
    // @InjectRepository(Portfolio) private repo: Repository<Portfolio>,
  ) {}

  // async get(identifier: string | Partial<Portfolio>): Promise<Portfolio> {
  //   if (!identifier) return null;
  //   let uuid: string = null;
  //   if ('string' === typeof identifier) {
  //     uuid = identifier;
  //   } else {
  //     uuid = identifier.uuid;
  //   }
  //   if (!uuid) {
  //     return null;
  //   }
  //   return this.repo.findOne({ uuid });
  // }

  // async getUser(portfolio: Portfolio): Promise<User> {
  //   if (portfolio.user) return portfolio.user;
  //   return this.repo
  //     .createQueryBuilder()
  //     .relation(Portfolio, 'user')
  //     .of(portfolio)
  //     .loadOne()
  // }

  // async create(user: User, data: Partial<Portfolio>): Promise<Portfolio> {
  //   const portfolio = new Portfolio();
  //   const cloned    = Object.assign({}, data);
  //   delete cloned.uuid;
  //   Object.assign(portfolio, cloned);
  //   portfolio.user = user;
  //   await portfolio.save();
  //   return portfolio;
  // }

  // async remove(user: User, identifier: string | Partial<Portfolio>) {
  //   const portfolio = await this.get(identifier);
  //   portfolio.user  = await this.getUser(portfolio);
  //   if (user.uuid !== portfolio.user.uuid) return false;
  //   await portfolio.remove();
  //   return true;
  // }

  // // Updates all tickers, but only once per provider
  // @Cron('0 * * * * *') // Run every minute, TODO: no polling
  // async updateAllTickers() {
  //   let uuid          = '';
  //   let portfolio     = await Portfolio.findOne({ uuid: MoreThan(uuid) });
  //   const hadProvider = {};

  //   do {
  //     uuid           = portfolio.uuid;
  //     if (hadProvider[portfolio.provider]) continue;
  //     const adapter  = AbstractAdapter.instance(portfolio);
  //     const products = await adapter.getProducts();
  //     if (!products) continue;
  //     hadProvider[portfolio.provider] = true;

  //     await Promise.all(products.map(async product => {
  //       const ticker = await adapter.getTicker(product.id);
  //       ticker.save();
  //     }));

  //   } while(portfolio = await Portfolio.findOne({ uuid: MoreThan(uuid) }));
  // }

}
