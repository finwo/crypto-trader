import      { Account            } from '../type/account';
import      { Book               } from '../type/book';
import      { CoinbaseConnection } from '../type/connection';
import      { Market             } from '../type/market';
import      { Order              } from '../type/order';
import      { Fee                } from '../type/fee';
import      { Provider           } from '../interface/provider';
import      { createHmac         } from 'crypto';
import * as   https                from 'https';

export class CoinbaseProvider implements Provider {

    static opts = {
        hostname : 'api.exchange.coinbase.com',
        port     : 443,
    };

    protected _call(
        connection : CoinbaseConnection,
        method     : string,
        path       : string,
        body       : any = undefined,
    ): Promise<any> {
        return new Promise(resolve => {
            body   = body && JSON.stringify(body);
            method = method.toUpperCase();
            const timestamp = Date.now() / 1000;
            const message   = timestamp + method + path + (body || '');
            const key       = Buffer.from(connection.credentials.secret, 'base64');
            const hmac      = createHmac('sha256', key);
            const signature = hmac.update(message).digest('base64');
            const headers   = {
                'Accept'               : 'application/json',
                'User-Agent'           : 'WIP - Finwo\'s crypto trader',
                'CB-ACCESS-KEY'        : connection.credentials.key,
                'CB-ACCESS-SIGN'       : signature,
                'CB-ACCESS-TIMESTAMP'  : timestamp,
                'CB-ACCESS-PASSPHRASE' : connection.credentials.passphrase,
            };
            if ((method !== 'GET') && body) {
                headers['Content-Type']   = 'application/json';
                headers['Content-Length'] = body.length;
            }
            const request   = https.request({
                ...CoinbaseProvider.opts,
                method,
                path,
                headers,
            }, res => {
                let responseBody = Buffer.alloc(0);
                res.on('data', chunk => responseBody = Buffer.concat([ responseBody, chunk ]));
                res.on('end', () => {
                    resolve(JSON.parse(responseBody.toString()));
                });
            });
            request.write(body || '');
            request.end();
        });
    }

    async getAccounts(connection: CoinbaseConnection): Promise<Account[]> {
        return this._call(connection, 'GET', '/accounts') as Promise<Account[]>;
    }

    async getMarket(connection: CoinbaseConnection, market: string): Promise<Market> {
        const raw: {[index:string]:any} = await this._call(connection, 'GET', `/products/${market}`);
        return {
            base_currency          : raw.base_currency,
            quote_currency         : raw.quote_currency,
            price_increment        : parseFloat(raw.quote_increment),
            size_increment         : parseFloat(raw.base_increment),
            trade_minimum          : parseFloat(raw.quote_increment),
            trade_minimum_notional : 0,
        };
    }

    async getBook(connection: CoinbaseConnection, market: string): Promise<Book> {
        const raw = await this._call(connection, 'GET', `/products/${market}/book?level=1`) as {bids:string[][],asks:string[][]};
        return {
            bid: {
                price : parseFloat(raw.bids[0][0]),
                size  : parseFloat(raw.bids[0][1]),
            },
            ask: {
                price : parseFloat(raw.asks[0][0]),
                size  : parseFloat(raw.asks[0][1]),
            },
        } as Book;
    };

    async getFee(connection: CoinbaseConnection, market: string): Promise<Fee> {
        const raw = await this._call(connection, 'GET', `/fees`) as {taker_fee_rate:string,maker_fee_rate:string};
        return {
            maker : parseFloat(raw.maker_fee_rate),
            taker : parseFloat(raw.taker_fee_rate),
        } as Fee;
    }

    async postOrder(connection: CoinbaseConnection, order: Order): Promise<any> {
        const bdy: {[index:string]:any} = {...order, product_id: order.market};
        delete bdy.market;
        // Emulate Immediate-or-cancel and fill-or-kill modes
        if (order.time_in_force == 'IOC') Object.assign(bdy, { time_in_force: 'GTT', cancel_after: 'minute' });
        if (order.time_in_force == 'FOK') Object.assign(bdy, { time_in_force: 'GTT', cancel_after: 'minute' });
        return this._call(connection, 'POST', '/orders', bdy);
    }

}

export const coinbase = new CoinbaseProvider();
