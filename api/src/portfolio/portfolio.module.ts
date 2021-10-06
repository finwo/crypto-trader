import { Module } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioResolver } from './portfolio.resolver';
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from '../user/user.module';
import { ScheduleModule } from '@nestjs/schedule';

import { database } from '@config';
import { Portfolio } from './model/portfolio';
import { Ticker } from './model/ticker';
database.entities.push(Portfolio);
database.entities.push(Ticker);

import { registerAdapter } from './adapter/abstract';
import { CoinbaseAdapter } from './adapter/coinbase';
registerAdapter('coinbase', portfolio => new CoinbaseAdapter(portfolio));

@Module({
  imports: [
    ScheduleModule,
    UserModule,
    TypeOrmModule.forFeature([Portfolio]),
  ],
  providers: [PortfolioService, PortfolioResolver]
})
export class PortfolioModule {}
