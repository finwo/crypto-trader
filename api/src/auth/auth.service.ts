import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/model/user';
import supercop from 'supercop';
import * as config from '@config';
import base64url from 'base64url';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService
  ) {}

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

  // Builds server-signed token that points to the user
  async buildAccessToken(identifier: string | Partial<User>): Promise<string> {
    const user   = await this.userService.get(identifier);
    const now    = Math.floor(Date.now() / 1000);
    const header = base64url.encode(JSON.stringify({typ: 'jct',alg: 'ed25519'}));
    const body   = base64url.encode(JSON.stringify({sub: user.uuid, iat: now, exp: now + 3600}));
    const signature = base64url.encode(await config.auth.kp.sign(`${header}.${body}`));
    return `${header}.${body}.${signature}`;
  }

}
