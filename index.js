const bodyParser   = require('body-parser');
const cors         = require('cors');
const finalhandler = require('finalhandler');
const http         = require('http');
const morgan       = require('morgan');
const scandir      = require('./lib/scandir');
const serveStatic  = require('serve-static');

// Load conifg (shown = default)
const config = require('rc')('cbtrader', {
  port: 8080,
});

// Initialize router
const Router = require('router');
const app    = new Router();

// Add middleware
app.use(morgan('tiny'));
app.use(cors());
app.use(bodyParser.json());

// Initialize global http responses
global.HttpResponse   = require('./lib/http/http-response');
global.HttpOk         = require('./lib/http/http-ok');
global.HttpBadRequest = require('./lib/http/http-bad-request');
global.HttpNotFound   = require('./lib/http/http-not-found');
global.HttpError      = require('./lib/http/http-error');

// Fetch all routes
const routes = [];
scandir(`${__dirname}/controller`, function logRoute(route) {
  if (Array.isArray(route)) return route.map(logRoute);
  console.log({route});
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
    if (result instanceof HttpResponse) result.send(req, res);
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
}).listen(parseInt(config.port), err => {
  if (err) throw err;
  console.log(`Listening on :${config.port}`);
});
