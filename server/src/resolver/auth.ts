import { Arg, Resolver, Query, Mutation } from 'type-graphql';
import { Service } from 'typedi';
import { Account } from '@entity/account';
import { AccountRepository } from '../repository/account';
import supercop from 'supercop';

import { ConflictError } from '../error/conflict-error';
import { SignatureError } from '../error/signature-error';

@Service()
@Resolver()
export class AuthResolver {

  constructor(
    private accountRepository: AccountRepository
  ) {}

  @Mutation(() => Account)
  async register(@Arg('email') email: string, @Arg('pubkey') pubkey: string, @Arg('signature') signature: string): Promise<Account | Account[]> {

    // Check if email already exists
    const found = await this.accountRepository.find({ email });
    if (found.length) {
      throw new ConflictError("Email already in use", 'email');
    }

    // Verify signature
    const message = Buffer.from(email);
    const sig     = Buffer.from(signature, 'hex');
    const pk      = Buffer.from(pubkey   , 'hex');
    const isValid = await supercop.verify( sig, message, pk );
    if (!isValid) {
      throw new SignatureError("Invalid signature");
    }

    // From this point on, we focus on inserting the account
    return this.accountRepository.insert({
      email,
      pubkey
    });
  }

}
