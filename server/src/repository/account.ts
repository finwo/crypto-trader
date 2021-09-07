import { Service } from 'typedi';
import { Account } from '@entity/account';
import { AbstractRepository } from './abstract';

let instance = null;

@Service()
export class AccountRepository extends AbstractRepository<Account> {
  constructor() {super(Account)}
}
