import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/model/user';
import supercop from 'supercop';
import * as config from '@config';
import base64url from 'base64url';

import { AuthenticationToken } from './auth.model';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService
  ) {}

  // Doesn't re-use validateSignature to perform some extra verbose checking
  async register(email: string, nonce: number, pubkey: string, signature: string): Promise<User> {

    // Verify nonce within 5 minutes
    if (Math.abs(Math.floor(Date.now() / 1000) - nonce) > 300) throw new Error("Nonce skewed");

    // Check if user doesn't already exist
    const found = await this.userService.find({ email });
    if (found.length) throw new Error("Email already exists");

    // Hex-encoded pubkey
    const pubkeyDecoded = Buffer.from(pubkey, 'hex');
    if (pubkeyDecoded.length !== 32) throw new Error("Pubkey not 32 hex-encoded bytes");
    // const kp = supercop.keyPairFrom({ pubkey: pubkeyDecoded });

    // Verify signature
    const message = `register|${email}|${nonce}`;
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

  async verifyLogin(email: string, nonce: number, signature: string): Promise<User> {
    // Verify nonce within 5 minutes
    if (Math.abs(Math.floor(Date.now() / 1000) - nonce) > 300) throw new Error("Nonce skewed");

    // Check if user exists
    const found = await this.userService.findOne({ email });
    if (!found) throw new Error("Invalid credentials"); // email not found

    // Verify signature
    const message = `login|${email}|${nonce}`;
    if (!await this.validateSignature(
      message,
      found.pubkey,
      signature
    )) {
      throw new Error("Invalid credentials"); // invalid password
    }

    // Signature verified, return the user
    return found;
  }

  async validateSignature(message: string, pubkey: string, signature: string) {
    const pubkeyDecoded = Buffer.from(pubkey, 'hex');
    if (pubkeyDecoded.length !== 32) return false;
    const signatureDecoded = Buffer.from(signature, 'hex');
    if (signatureDecoded.length !== 64) return false;
    return supercop.verify(
      signatureDecoded,
      message,
      pubkeyDecoded,
    );
  }

  // Builds server-signed token that points to the user
  async buildAccessToken(auth: AuthenticationToken): Promise<string> {
    const header = base64url.encode(JSON.stringify({typ: 'jct',alg: 'ed25519'}));
    const body   = base64url.encode(JSON.stringify({sub: auth.user.uuid, iat: auth.issuedAt, exp: auth.expiresAt}));
    const signature = base64url.encode(await config.auth.kp.sign(`${header}.${body}`));
    return `${header}.${body}.${signature}`;
  }

}
