const bodyParser   = require('body-parser');
const cors         = require('cors');
const CronJob      = require('cron').CronJob;
const exchanges    = require('./lib/exchange');
const fs           = require('fs');
const http         = require('http');
const morgan       = require('morgan');
const rc4          = require('rc4-crypt');
const scandir      = require('./lib/scandir');
const Sequelize    = require('sequelize');
const serveStatic  = require('serve-static');
const strategies   = require('./lib/strategy');
const supercop     = require('supercop');

// Initialize app
const Router = require('router');
global.app   = new Router();
app.manifest = [];
app.history  = [];

// Pre-compile regexes
app.regex = {
  email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
};

(async () => {

  // Load config (shown = default)
  app.config = require('rc')('cbtrader', {
    ...require('./config'),
    port: parseFloat(process.env.PORT || 8080),
    db  : process.env.DATABASE_URL || 'sqlite::memory:',
  });

  // Initialize auth key
  app.keypair = await supercop.createKeyPair(rc4(app.config.authseed)(' '.repeat(supercop.createSeed().length)));

  // Add middleware
  app.use(morgan('tiny'));
  app.use(cors());
  app.use(bodyParser.json());
  app.use(require('./middleware/auth'));

  // Initialize global http responses
  app.HttpBadRequest       = require('./lib/http/http-bad-request');
  app.HttpConflict         = require('./lib/http/http-conflict.js');
  app.HttpError            = require('./lib/http/http-error');
  app.HttpNotFound         = require('./lib/http/http-not-found');
  app.HttpOk               = require('./lib/http/http-ok');
  app.HttpPermissionDenied = require('./lib/http/http-permission-denied');
  app.HttpResponse         = require('./lib/http/http-response');
  app.HttpUnauthorized     = require('./lib/http/http-unauthorized');

  // Fetch all routes
  const routes = [];
  scandir(`${__dirname}/controller`, function logRoute(route) {
    if (Array.isArray(route)) return route.map(logRoute);
    if (route.name) {
      app.manifest.push({
        method: route.method,
        path  : route.path,
        name  : route.name,
      });
    }
    routes.push(route);
  }, ['js']);

  // Order routes by specificness (matters in our router)
  routes.sort((A, B) => {
    const aparts = A.path.split('/');
    const bparts = B.path.split('/');
    for(let i=0; i<Math.min(aparts.length,bparts.length); i++) {
      if (
        (aparts[i].substr(0,1) === ':') &&
        (bparts[i].substr(0,1) !== ':')
      ) {
        return 1;
      }
      if (
        (aparts[i].substr(0,1) !== ':') &&
        (bparts[i].substr(0,1) === ':')
      ) {
        return -1;
      }
    }
    return bparts.length - aparts.length;
  });

  // Register all routes
  for(const route of routes) {
    app[route.method](route.path, async (req, res, ...args) => {
      const result = await route.handler(req, res, ...args);
      if (result instanceof app.HttpResponse) result.send(req, res);
    });
  }

  // Setup static router
  const serve = serveStatic('public', {
    index: [
      'index.htm',
      'index.html',
    ],
  });

  // Initialize database
  app.db = new Sequelize(app.config.db);
  require('./model')(app.db);
  await app.db.sync({ alter: true });

  // Setup server & start listening
  http.createServer((req, res) => {
    const indexContent = fs.readFileSync(`${__dirname}/public/index.html`);
    app(req, res, () => {
      serve(req, res, () => {
        res.setHeader('content-type', 'text/html');
        res.end(indexContent);
      });
    });
  }).listen(parseInt(app.config.port), err => {
    if (err) throw err;
    console.log(`Listening on :${app.config.port}`);
  });

  // The fn that actually trades
  const trade = async () => {
    let portfolioId = 0;
    let portfolio   = null;

    for(;;) {

      // Fetch portfolio
      portfolio = await app.db.models.Portfolio.findOne({
        where: {id: {[Sequelize.Op.gt]: portfolioId}},
      });
      if (!portfolio) break;
      portfolioId = portfolio.id;

      // Fetch exchange
      if (!(portfolio.exchange in exchanges)) continue;
      const exchange = new exchanges[portfolio.exchange](portfolio);

      // Fetch strategy
      if (!(portfolio.strategy in strategies)) continue;
      const strategy = strategies[portfolio.strategy];

      // TRADE!
      await strategy(portfolio, exchange);
    }
  };

  // Kick-start trading
  const job = new CronJob('0 * * * * *', trade);
  job.start();
})();
