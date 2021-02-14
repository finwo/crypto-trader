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
app.history  = [];

// Load conifg (shown = default)
app.config = require('rc')('cbtrader', {
  ...require('./config'),
  port: parseFloat(process.env.PORT || 8080),
});

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

// The fn that actually trades
const trade = async () => {
  const coinbase = require('./lib/coinbase');
  const now      = Date.now();
  const data     = {timestamp:now,fee:{},market:{},account:{}};
  app.history.push(data);

  // Fetch fees
  const feedata = await coinbase.getFees();
  data.fee.make = parseFloat(feedata.maker_fee_rate);
  data.fee.take = parseFloat(feedata.taker_fee_rate);

  // Fetch current markets
  await Promise.all(app.config.markets.map(async market => {
    const marketId = `${market.alt}-${market.base}`;
    data.account[market.alt]  = {balance:0,hold:0,available:0,value:0};
    data.account[market.base] = {balance:0,hold:0,available:0,value:0};
    data.market[marketId]     = await coinbase.getMarket(marketId);
  }));

  // Fetch accounts
  (await coinbase.getAccounts())
    .filter(account => {
      account.balance   = parseFloat(account.balance);
      account.hold      = parseFloat(account.hold);
      account.available = parseFloat(account.available);
      account.value     = (data.market[`${account.currency}-${app.config.marketBase}`] || 1) * account.available;
      if (account.currency == app.config.marketBase) {
        account.value /= app.config.markets.length;
      }
      return account.available > 0.001;
    })
    .forEach(account => {
      data.account[account.currency] = account;
      delete account.balance;
      delete account.currency;
      delete account.hold;
      delete account.id;
      delete account.proile_id;
      delete account.trading_enabled;
    });

  // Balance out value
  for(const market of app.config.markets) {
    const marketId = `${market.alt}-${market.base}`;

    // No market info = skip
    if (!data.market[marketId]) continue;

    // Start preparing order
    const diff  = Math.abs(data.account[market.alt].value - data.account[market.base].value);
    const order = {
      product_id: marketId,
      side      : data.account[market.alt].value > data.account[market.base].value ? 'sell' : 'buy',
      type      : 'market',
      size      : diff / (1+(1/app.config.markets.length)) / data.market[marketId],
    };

    // Fix roundings according to market
    order.size = Math.round(order.size * Math.pow(10,market.precision)) / Math.pow(10,market.precision);

    // Bail if the order is too small
    const bandstop = data.account[market.alt].available * ((data.fee.take * 2) + app.config.margin)
    if (order.size < Math.pow(10,0 - market.minimum)) continue;
    if (order.size < bandstop) continue;

    // Execute order
    const res = await coinbase.postOrder(order);
    const msg = {order};
    if (res.message) msg.message = res.message;
    console.log(msg);

    // Adjust precision
    if (res.message && (res.message.substr(0,20) == 'size is too accurate')) {
      market.precision -= 1;
      continue;
    }

    // Adjust minimum
    if (res.message && (res.message.substr(0,17) == 'size is too small')) {
      market.minimum -= 1;
      continue;
    }

    return;
  }

  // Dump large history
  while(app.history.length > (app.config.histlen / app.config.interval)) app.history.shift();
};

// Kick-start trading
trade();
setInterval(trade, app.config.interval);
