import { Service, Inject } from 'typedi';
import { Repository } from '@db';

// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

import { User } from './model/user';
// import { Portfolio } from '../portfolio/model/portfolio';

@Service()
export class UserService {
  private repo: Repository<User>

  constructor() {
    this.repo = new Repository(User);
  }

  async get(identifier: string | Partial<User>): Promise<User> {
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
    return this.repo.get(uuid);
  }

  // async get(identifier: string | Partial<User>): Promise<User> {
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

  async create(email: string, pubkey: string): Promise<User> {
    const user = new User();
    Object.assign(user, {email, pubkey});
    await this.repo.save(user);
    return user;
  }

  async update(identifier: string, data: Partial<User>): Promise<User> {
    delete data.uuid;
    const user = await this.get(identifier);
    Object.assign(user,data);
    await this.repo.save(user);
    return user;
  }

  findOne(query?: {[index:string]:any}): Promise<User> {
    return this.repo.findOne(query);
  }

  find(query?: {[index:string]:any}): Promise<User[]> {
    return this.repo.find(query);
  }
}
