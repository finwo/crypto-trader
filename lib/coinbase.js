const crypto = require('crypto');
const fetch  = require('node-fetch');
const qs     = require('qs');
const {URL}  = require('url');
const rps    = 3;
const requests = [];

function hmac(salt, message) {
  return crypto
    .createHmac('sha256', salt)
    .update(message)
    .digest('base64');
};

let baseuri    = null;
let key        = null;
let secret     = null;
let passphrase = null;

module.exports = {

  init() {
    baseuri    = process.env.COINBASE_BASEURI    || 'https://api.pro.coinbase.com/';
    key        = process.env.COINBASE_KEY        || '';
    secret     = process.env.COINBASE_SECRET     || '';
    passphrase = process.env.COINBASE_PASSPHRASE || '';
  },

  get(uri, options) {
    if (!baseuri) this.init();
    return this._call(uri, { ...options, method: 'GET' });
  },

  post(uri, options) {
    if (!baseuri) this.init();
    return this._call(uri, { ...options, method: 'POST' });
  },

  async _call(uri, options) {

    // Limit requests per second
    while((requests.length >= rps) && ((Date.now() - requests[0]) < 1000)) {
      await new Promise(r => setTimeout(r,100));
    }
    while (requests.length >= rps) requests.shift();
    requests.push(Date.now());

    const now = (Date.now()/1000);
    uri = new URL(`${baseuri}${uri}`);
    opts = {
      method: options.method || 'GET',
      headers: {
        'CB-ACCESS-KEY'       : key,
        'CB-ACCESS-TIMESTAMP' : now,
        'CB-ACCESS-PASSPHRASE': passphrase,
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
      Buffer.from(secret,'base64'),
      `${now}${opts.method}${uri.pathname}${opts.body||''}`
    );

    return fetch(uri.toString(), opts)
      .then(res => res.json());
  },

  getAccounts() {
    return this.get('accounts');
  },

  getProductTrades(product) {
    return this.get(`products/${product}/trades`);
  },

  async getMarket(marketId) {
    const trades   = await this.getProductTrades(marketId);
    const chosen   = [];
    let   buys     = 0;
    let   sells    = 0;

    // Select trades to base price on
    while(!(buys && sells)) {
      if (!trades.length) break;
      const trade = trades.shift();
      if (trade.side == 'sell') sells++;
      if (trade.side == 'buy' ) buys++;
      chosen.push(trade);
    }

    // Return average the price
    return chosen.reduce((r,a) => r+parseFloat(a.price),0) / chosen.length;
  },

  getFees() {
    return this.get('fees');
  },

  postOrder(order) {
    return this.post('orders', {data: order});
  },

};
