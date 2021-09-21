import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserModel } from './user.model';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserModel) private repo: Repository<UserModel>
  ) {}

  async get(identifier: string | Partial<UserModel>): Promise<UserModel> {
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

  async create(email: string, pubkey: string): Promise<UserModel> {
    const user = new UserModel();
    Object.assign(user, {email, pubkey});
    await user.save();
    return user;
  }

  async findOne(query?: {[index:string]:any}): Promise<UserModel> {
    return this.repo.findOne(query);
  }

  async find(query?: {[index:string]:any}): Promise<UserModel[]> {
    return this.repo.find(query);
  }

}
