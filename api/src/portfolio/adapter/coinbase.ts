import { Injectable } from '@nestjs/common';
import { AbstractAdapter, ProductDescriptor } from './abstract';
import { lock, unlock } from 'nlock';

import { Portfolio } from '../model/portfolio';
import { Ticker } from '../model/ticker';

import { URL } from 'url';
import crypto from 'crypto';
const qs    = require('qs');
const fetch = require('isomorphic-unfetch');

const rps        = 10;
const rateLimits = [];

export type CoinbaseCredentials = {
  key: string;
  secret: string;
  passphrase: string;
};

@Injectable()
export class CoinbaseAdapter extends AbstractAdapter {
  private baseurl = 'https://api.exchange.coinbase.com';
  private credentials: CoinbaseCredentials;

  constructor(portfolio: Portfolio) {
    super(portfolio);
    this.credentials = JSON.parse(portfolio.credentials);
    if (!this.credentials.key) throw new Error("Credentials missing key");
    if (!this.credentials.secret) throw new Error("Credentials missing secret");
    if (!this.credentials.passphrase) throw new Error("Credentials missing passphrase");
  }

  protected async _call(path: string, opts: {[index:string]:any} = {}): Promise<any> {
    // Wait for this thread's turn (rate limiting)
    // Holds lock when limiting
    await lock('adapter:coinbase:call:rps');
    let start = Date.now();                                    // Quick ref to current timestamp
    rateLimits.push(start + 1000);                             // Track how far we would block when limiting
    if (rateLimits.length >= rps) {                            // If we're rate-limiting
      const target = rateLimits.shift();                       // Fetch end of grace-period
      if (target > start) {                                    // If still in the grace-period
        await new Promise(r => setTimeout(r, target - start)); // Wait for it to end
      }
    }
    unlock('adapter:coinbase:call:rps');

    // Prepare query if data given to GET
    opts = Object.assign({method:'GET',headers:{}}, opts);
    const url   = new URL(path, this.baseurl);
    const query = qs.parse(url.search);
    if (opts.method == 'GET' && opts.data) {
      Object.assign(query, opts.data);
      url.search = qs.stringify(query);
    }

    try {
      const response = await (await fetch(url.toString(), opts)).json();
      return response;
    } catch(e) {
      console.error(e);
      return null;
    }
  }

  protected _call_authenticated(path: string, method: string = 'POST', data: {[index:string]:any} = null): Promise<any> {
    method = method.toUpperCase();
    const opts = {
      method  : method.toUpperCase(),
      headers : {},
      body    : undefined,
    };

    if (data) {
      opts.headers['CB-ACCESS-KEY']        = this.credentials.key,
      opts.headers['CB-ACCESS-PASSPHRASE'] = this.credentials.passphrase,
      opts.headers['CB-ACCESS-TIMESTAMP']  = '' + Math.floor(Date.now() / 1000);
      opts.body                            = JSON.stringify(data);

      const message   = `${opts.headers['CB-ACCESS-KEY']}${opts.method}${path}${opts.body}`;
      const signature = crypto.createHmac('sha256', Buffer.from(this.credentials.secret, 'base64')).update(message).digest('base64');
    }

    return this._call(path, opts);
  }

  public getProducts(): Promise<ProductDescriptor[]> {
    return this._call('/products').then(descriptors => {
      return descriptors.map(descriptor => ({
        ...descriptor,
        base_min_size           : parseFloat(descriptor.base_min_size),
        base_max_size           : parseFloat(descriptor.base_max_size),
        quote_increment         : parseFloat(descriptor.quote_increment),
        base_increment          : parseFloat(descriptor.base_increment),
        min_market_funds        : parseFloat(descriptor.min_market_funds),
        max_market_funds        : parseFloat(descriptor.max_market_funds),
        max_slippage_percentage : parseFloat(descriptor.max_slippage_percentage),
      }));
    });
  }

  public getAccounts(): Promise<any> {
    return this._call_authenticated('/accounts', 'POST');
  }

  public async getTicker(product: string): Promise<Ticker> {
    const data   = await this._call(`/products/${product}/ticker`);
    const ticker = new Ticker();
    ticker.provider = 'coinbase';
    ticker.product  = product;
    ticker.price    = parseFloat(data.price);
    ticker.bid      = parseFloat(data.bid);
    ticker.ask      = parseFloat(data.ask);
    ticker.volume   = parseFloat(data.volume);
    return ticker;
  }

}
