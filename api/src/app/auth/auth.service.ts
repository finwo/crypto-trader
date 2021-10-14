import { Service } from 'typedi';

// import { Cron, Timeout } from '@nestjs/schedule';
// import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/model/user';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, LessThan } from 'typeorm';
// import { AuthenticationToken } from './model/authentication-token';

import supercop from 'supercop';
// import * as config from '@config';
// import base64url from 'base64url';

@Service()
export class AuthService {
  constructor(
    private userService: UserService
  //   @InjectRepository(AuthenticationToken) private repo: Repository<AuthenticationToken>
  ) {}

  // async get(identifier: string | Partial<AuthenticationToken>): Promise<AuthenticationToken> {
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

  // async getUser(identifier: string | Partial<AuthenticationToken>): Promise<User> {
  //   return this.repo
  //     .createQueryBuilder()
  //     .relation(AuthenticationToken, 'user')
  //     .of(identifier)
  //     .loadOne();
  // }

  // Doesn't re-use validateSignature to perform some extra verbose checking
  async register(email: string, nonce: number, pubkey: string, signature: string): Promise<User> {

    // Verify nonce within 5 minutes
    if (Math.abs(Math.floor(Date.now() / 1000) - nonce) > 300) throw new Error("Nonce skewed");
    console.log('NONCE MATCH');

    // Check if user doesn't already exist
    const found = await this.userService.find({ email });
    if (found.length) throw new Error("Email address already in use");
    console.log('NOT PRE-FOUND');

    // Hex-encoded pubkey
    const pubkeyDecoded = Buffer.from(pubkey, 'hex');
    if (pubkeyDecoded.length !== 32) throw new Error("Pubkey not 32 hex-encoded bytes");
    // const kp = supercop.keyPairFrom({ pubkey: pubkeyDecoded });
    console.log('PUBKEY', pubkeyDecoded);

    // Verify signature
    const message = `register|${email}|${nonce}`;
    console.log('MSG', message);
    if (!await supercop.verify(
      Buffer.from(signature, 'hex'),
      message,
      pubkeyDecoded
    )) {
      throw new Error("Invalid signature");
    }

    // Signature verified, user doesn't exist yet, let's create
    return this.userService.create(email, pubkey);
  }

  async login(email: string, nonce: number, signature: string): Promise<User> {

    // Verify nonce within 5 minutes
    if (Math.abs(Math.floor(Date.now() / 1000) - nonce) > 300) throw new Error("Nonce skewed");

    // Check if user doesn't already exist
    const found = await this.userService.findOne({ email });
    if (!found) throw new Error("Invalid credentials"); // email not found

    // Hex-encoded pubkey
    const pubkeyDecoded = Buffer.from(found.pubkey, 'hex');
    if (pubkeyDecoded.length !== 32) throw new Error("Invalid credentials"); // pubkey broken..

    // Verify signature
    const message = `login|${email}|${nonce}`;
    if (!await supercop.verify(
      Buffer.from(signature, 'hex'),
      message,
      pubkeyDecoded
    )) {
      throw new Error("Invalid credentials"); // invalid password
    }

    // Signature verified, return the user
    return found;
  }

  // @Cron('0 * * * * *') // Every minute
  // async cleanTokens() {
  //   const now = Math.floor(Date.now() / 1000);
  //   await AuthenticationToken.delete({ expires: LessThan(now) });
  // }

}
