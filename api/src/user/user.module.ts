import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { User } from './model/user';
import { database } from '@config';

database.entities.push(User);

@Module({
  imports  : [TypeOrmModule.forFeature([User])],
  providers: [UserService, UserResolver],
  exports  : [UserService],
})
export class UserModule {}
