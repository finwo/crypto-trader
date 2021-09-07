require('dotenv').config();
require('reflect-metadata');
require('module-alias/register');

const express    = require('express');
const morgan     = require('morgan');
const config     = require('@config');
const expressJwt = require('express-jwt');

(async () => {
  const app = express();
  
  app.use(morgan('tiny'));
  app.use(expressJwt(config.auth))

  app.use(require('cors')());
  // app.use(require('helmet')());

  // Initialize app components
  const initOpts = { app };
  await require('./interface').apply(initOpts);

  app.listen({ port: config.http.port }, err => {
    console.log(`Server ready, listening at :${config.http.port}`);
  });
})();


