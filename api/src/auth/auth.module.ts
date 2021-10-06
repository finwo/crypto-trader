import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { AuthenticationToken } from './model/authentication-token';

import { database } from '@config';
database.entities.push(AuthenticationToken);

@Module({
  imports  : [
    TypeOrmModule.forFeature([AuthenticationToken]),
    UserModule,
    ScheduleModule,
  ],
  providers: [AuthService, AuthResolver],
})
export class AuthModule {}
