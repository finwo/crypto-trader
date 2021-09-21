import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserModel } from './user.model';

@Module({
  imports  : [TypeOrmModule.forFeature([UserModel])],
  providers: [UserService, UserResolver, UserModel],
  exports  : [UserService],
})
export class UserModule {}
