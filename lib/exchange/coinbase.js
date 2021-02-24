const crypto = require('crypto');
const fetch  = require('node-fetch');
const qs     = require('qs');
const {URL}  = require('url');

const requests_per_second = 3;
const requests            = [];

const cache     = {};
const cache_exp = 1e4; // 10 seconds

function hmac(salt, message) {
  return crypto
    .createHmac('sha256', salt)
    .update(message)
    .digest('base64');
};

class CoinbaseExchange {
  baseCurrency        = 'EUR';
  baseuri             = process.env.BASEURI_COINBASE || 'https://api.pro.coinbase.com/';
  key                 = '';
  secret              = '';
  passphrase          = '';

  constructor(settings) {
    if (settings.toJSON) settings = settings.toJSON();
    const opts = {...settings};
    if ('string' === typeof opts.credentials) {
      opts.credentials = JSON.parse(opts.credentials);
    }

    this.baseCurrency = opts.baseCurrency           || this.baseCurrency;
    this.baseuri      = opts.baseuri                || this.baseuri;
    this.key          = opts.credentials.key        || '';
    this.secret       = opts.credentials.secret     || '';
    this.passphrase   = opts.credentials.passphrase || '';
  }

  async __call(uri, options) {
    uri = new URL(`${uri}`);
    const opts = {
      ...options,
      method: options.method || 'GET',
    };

    // Limit requests per second
    while((requests.length >= requests_per_second) && ((Date.now() - requests[0]) < 1000)) {
      await new Promise(r => setTimeout(r,Math.max((requests[0]+1000)-Date.now(),10)));
    }
    while(requests.length >= requests_per_second) requests.shift();
    requests.push(Date.now());

    // Insert data
    if (('data' in opts) && ('undefined' !== typeof opts.data)) {
      if (opts.method == 'GET') {
        uri.search = '?' + qs.stringify(opts.data);
      } else {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(opts.data);
      }
      delete opts.data;
    }

    return fetch(uri.toString(), opts)
      .then(res => res.json());
  }

  async _call(uri, options) {
    const now = (Date.now()/1000);
    uri = new URL(`${uri}`);
    const opts = {
      method: options.method || 'GET',
      headers: {
        'CB-ACCESS-KEY'       : this.key,
        'CB-ACCESS-TIMESTAMP' : now,
        'CB-ACCESS-PASSPHRASE': this.passphrase,
        'CB-ACCESS-SIGN'      : null,
      },
    };

    if (('data' in options) && ('undefined' !== typeof options.data)) {
      if (opts.method == 'GET') {
        uri.search = '?' + qs.stringify(options.data);
      } else {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(options.data);
      }
    }

    opts.headers['CB-ACCESS-SIGN'] = hmac(
      Buffer.from(this.secret,'base64'),
      `${now}${opts.method}${uri.pathname}${opts.body||''}`
    )
    return this.__call(uri.toString(), opts);
  }

  __get(uri, options) {
    return this.__call(`${this.baseuri}${uri}`, { ...options, method: 'GET' });
  }

  _get(uri, options) {
    return this._call(`${this.baseuri}${uri}`, { ...options, method: 'GET' });
  }

  __post(uri, options) {
    return this.__call(`${this.baseuri}${uri}`, { ...options, method: 'POST' });
  }

  _post(uri, options) {
    return this._call(`${this.baseuri}${uri}`, { ...options, method: 'POST' });
  }

  async getProductBook(product) {

    // Return cached version if available
    const cachekey = `product_${product}`;
    if (cache[cachekey] && (cache[cachekey].exp > Date.now())) {
      return cache[cachekey].data;
    }

    // Fetch data & store in cache
    const data = await this.__get(`products/${product}/book`);
    cache[cachekey] = {exp:Date.now()+cache_exp,data};

    // Return our produce
    return data;
  }

  async getAccounts() {
    const accounts = await this._get('accounts');
    if (accounts.message) return null;
    for(const account of accounts) {
      account.available = parseFloat(account.available);
      account.balance   = parseFloat(account.balance);
      account.hold      = parseFloat(account.hold);
    }
    return accounts;
  }

  async getMarkets() {

    // Return cached version if available
    const cachekey = 'products';
    if (cache[cachekey] && (cache[cachekey].exp > Date.now())) {
      return cache[cachekey].data;
    }

    // Build data
    const products = await this.__get('products');
    const data = products
      .filter(product => !product.trading_disabled)
      .filter(product => !product.port_only)
      .filter(product => !product.limit_only)
      .filter(product => !product.cancel_only)
      .map(product => ({
        id       : product.id,
        base     : product.base_currency,
        quote    : product.quote_currency,
        minimum  : parseFloat(product.base_min_size),
        precision: parseFloat(product.base_increment),
      }));

    // Save cache & return data
    cache[cachekey] = {exp:Date.now()+cache_exp,data};
    return data;
  }

  async getMarket(marketId) {
    const book    = await this.getProductBook(marketId);
    const bid     = {price:parseFloat(book.bids[0][0]),size:parseFloat(book.bids[0][1])};
    const ask     = {price:parseFloat(book.asks[0][0]),size:parseFloat(book.asks[0][1])};
    const size    = bid.size + ask.size;
    const details = await this.__get(`products/${marketId}`);
    return {
      ask   : ask.price,
      bid   : bid.price,
      center: (ask.price + bid.price) / 2,
      min   : parseFloat(details.base_min_size),
      max   : parseFloat(details.base_max_size),
      step  : parseFloat(details.base_increment),
    };
  }

  async getValue() {
    const accounts = await this.getAccounts();
    let   value    = 0;
    if (!accounts) return NaN;
    for(const account of accounts) {
      if (!account.balance) continue;
      if (account.currency == this.baseCurrency) {
        value += account.balance;
        continue;
      }
      const market = await this.getMarket(`${account.currency}-${this.baseCurrency}`);
      value += account.balance * market.center;
    }
    return value;
  }

  async getFees() {
    const data = await this._get('fees');
    return {
      make: parseFloat(data.maker_fee_rate),
      take: parseFloat(data.taker_fee_rate),
    };
  }

  postOrder(order) {
    return this._post('orders', {data: order});
  }

  postMarketOrder(order) {
    return this.postOrder({
      type       : 'market',
      product_id : order.market,
      side       : order.side,
      size       : order.size,
    });
  }
}

CoinbaseExchange.validatePortfolio = async settings => {
  const exchange = new CoinbaseExchange(settings);
  return false;
};

module.exports = CoinbaseExchange;
