import 'reflect-metadata';
import 'module-alias/register';

const cors    = require('cors');
const express = require('express');

import { http } from '@config';

async function bootstrap() {
  const app = express();
  app.use(cors());
  await require('@db').init({ app });
  await require('./middleware/auth/jct-ed25519').init({ app });
  await require('@app').init({ app });
  await require('@graphql').init({ app });
  await app.listen(http.port, '0.0.0.0');
  console.log(`Listening on :${http.port}`);
}

bootstrap();
