import { Service } from 'typedi';
import { Portfolio } from '@entity/portfolio';
import { AbstractRepository } from './abstract';

let instance = null;

@Service()
export class PortfolioRepository extends AbstractRepository<Portfolio> {
  constructor() {super(Portfolio)}
}
