const accounts   = {ETH:{available:0},EUR:{available:0}};
const markets    = {'ETH-EUR':{price:0,minimum:1,precision:0,alt:'ETH'}};
const marketBase = 'EUR';
const margin     = 1.00 / 100;
const fees       = {make:0,take:0};

const bodyParser   = require('body-parser');
const cors         = require('cors');
const finalhandler = require('finalhandler');
const http         = require('http');
const morgan       = require('morgan');
const scandir      = require('./lib/scandir');
const serveStatic  = require('serve-static');

// Initialize app
const Router = require('router');
global.app   = new Router();
app.manifest = [];

// Load conifg (shown = default)
app.config = require('rc')('cbtrader', {
  port        : parseFloat(process.env.PORT || 8080),
  // database_url: process.env.DATABASE_URL || 'mysql://user:password@mysql/db',
});

// Initialize database
const Sequelize = require('sequelize');
// app.db          = new Sequelize(app.config.database_url);
app.triple      = require('./lib/triple')(app);
// require('./lib/model')(app);

// Add middleware
app.use(morgan('tiny'));
app.use(cors());
app.use(bodyParser.json());

// Initialize global http responses
app.HttpResponse   = require('./lib/http/http-response');
app.HttpOk         = require('./lib/http/http-ok');
app.HttpBadRequest = require('./lib/http/http-bad-request');
app.HttpNotFound   = require('./lib/http/http-not-found');
app.HttpError      = require('./lib/http/http-error');

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

// Setup server & start listening
http.createServer((req, res) => {
  app(req, res, () => {
    serve(req, res, finalhandler(req, res));
  });
}).listen(parseInt(app.config.port), err => {
  if (err) throw err;
  console.log(`Listening on :${app.config.port}`);
});

// Do the actual trading
setInterval(async () => {
  const coinbase = require('./lib/coinbase');

  // Fetch fees
  const feedata = await coinbase.getFees();
  fees.make = parseFloat(feedata.maker_fee_rate);
  fees.take = parseFloat(feedata.taker_fee_rate);

  // Fetch current markets
  await Promise.all(Object.keys(markets).map(async marketId => {
    markets[marketId].price = await coinbase.getMarket(marketId);
  }));

  // Fetch accounts
  const accountList = (await coinbase.getAccounts())
    .filter(account => {
      account.balance   = parseFloat(account.balance);
      account.hold      = parseFloat(account.hold);
      account.available = parseFloat(account.available);
      if (account.available < 0.001) return false;
      return true;
    })
    .forEach(account => {
      const market = `${account.currency}-${marketBase}`;
      accounts[account.currency] = {
        ...accounts[account.currency],
        ...account,
        value: ((market in markets) ? markets[market].price : 1) * account.available,
      };
    });

  // Balance out markets
  Object.keys(markets).forEach(async marketId => {

    // Fetch difference between balances
    const market      = markets[marketId];
    const balance_eur = accounts.EUR.value;
    const balance_alt = accounts[market.alt].value;
    const diff        = Math.abs(balance_eur - balance_alt);

    // No market info = skip
    if (!market.price) return;

    // Prepare order
    const order = {
      product_id: marketId,
      side      : null,
      type      : 'market',
      size      : ((diff / 2) / market.price).toFixed(market.precision),
    };

    // Skip if small order
    if (order.size < market.minimum) return;

    // Sell if high
    if ( (balance_alt * (1 - (fees.take*2) - margin)) > balance_eur ) {
      order.side = 'sell';
    }

    // Buy if low
    if ( (balance_alt * (1 + (fees.take*2) + margin)) < balance_eur ) {
      order.side = 'buy';
    }

    // Bail if no side was chosen
    if (!order.side) return;

    // Execute order
    const res = await coinbase.postOrder(order);

    const msg = {order};
    if (res.message) msg.message = res.message;
    console.log(msg);
  });
}, 1e3);

