const crypto = require('crypto');
const fetch  = require('node-fetch');
const qs     = require('qs');
const {URL}  = require('url');

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
  requests_per_second = 6;
  requests            = [];

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

  async _call(uri, options) {

    // Limit requests per second
    while((this.requests.length >= this.requests_per_second) && ((Date.now() - this.requests[0]) < 1000)) {
      await new Promise(r => setTimeout(r,Math.max((this.requests[0]+1000)-Date.now(),10)));
    }
    this.requests = this.requests.slice(1 - this.requests_per_second);
    this.requests.push(Date.now());

    const now = (Date.now()/1000);
    uri = new URL(`${this.baseuri}${uri}`);
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
    return fetch(uri.toString(), opts)
      .then(res => res.json());
  }

  _get(uri, options) {
    return this._call(uri, { ...options, method: 'GET' });
  }

  _post(uri, options) {
    return this._call(uri, { ...options, method: 'POST' });
  }

  getProductTrades(product) {
    return this._get(`products/${product}/trades`);
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

  async getMarket(marketId) {
    const trades   = await this.getProductTrades(marketId);
    if (trades.message) return NaN;
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
      value += account.balance * market;
    }
    return value;
  }
}

CoinbaseExchange.validatePortfolio = async settings => {
  const exchange = new CoinbaseExchange(settings);
  return false;
};

module.exports = CoinbaseExchange;
