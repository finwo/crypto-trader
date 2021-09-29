import { Module } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioResolver } from './portfolio.resolver';
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from '../user/user.module';

import { Portfolio } from './model/portfolio';
import { database } from '@config';

database.entities.push(Portfolio);

@Module({
  imports: [UserModule,TypeOrmModule.forFeature([Portfolio])],
  providers: [PortfolioService, PortfolioResolver]
})
export class PortfolioModule {}
