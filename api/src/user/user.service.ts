import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './model/user';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>
  ) {}

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
    return this.repo.findOne({ uuid });
  }

  async create(email: string, pubkey: string): Promise<User> {
    const user = new User();
    Object.assign(user, {email, pubkey});
    await user.save();
    return user;
  }

  async update(identifier: string | Partial<User>, data: Partial<User>): Promise<User> {
    delete data.uuid;
    const user = await this.get(identifier);
    Object.assign(user,data);
    await user.save();
    return user;
  }

  async findOne(query?: {[index:string]:any}): Promise<User> {
    return this.repo.findOne(query);
  }

  async find(query?: {[index:string]:any}): Promise<User[]> {
    return this.repo.find(query);
  }

}
