import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

import * as config from '@config';

@Module({
  imports: [
    TypeOrmModule.forRoot(config.database),
    GraphQLModule.forRootAsync({
      useFactory : () => ({
        autoSchemaFile : true,
        context        : async ({ req, res }) => ({
          req, res,
          auth: req[config.auth.authProperty],
        })
      }),
    }),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
