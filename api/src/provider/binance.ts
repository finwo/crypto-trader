import { Account           } from '../type/account';
import { Book              } from '../type/book';
import { Market            } from '../type/market';
import { Order             } from '../type/order';
import { Fee               } from '../type/fee';
import { BinanceConnection } from '../type/connection';
import { Provider          } from '../interface/provider';
import { Spot              } from '@binance/connector';

const clientCache: {[index:string]:Spot} = {};

export class BinanceProvider implements Provider {

    private _getClient(connection: BinanceConnection): Spot {
        if (!(connection.credentials.key in clientCache)) {
            clientCache[connection.credentials.key] = new Spot(connection.credentials.key, connection.credentials.secret);
        }
        return clientCache[connection.credentials.key];
    }

    async getAccounts(connection: BinanceConnection): Promise<Account[]> {
        const client     = this._getClient(connection);
        const raw        = await client.account();
        const rawData    = raw.data;

        return raw.data.balances.map(rawBalance => ({
            currency : rawBalance.asset,
            balance  : parseFloat(rawBalance.free) + parseFloat(rawBalance.locked),
        }));
    }

    async getMarket(connection: BinanceConnection, market: string): Promise<Market> {
        const client     = this._getClient(connection);
        const raw        = await client.exchangeInfo({ symbol: market });
        const rawMarket  = raw.data.symbols.find(m => m.symbol == market);
        const marketData = {
            quote_currency         : rawMarket.quoteAsset,
            base_currency          : rawMarket.baseAsset,
            price_increment        : eval(`1e-${parseInt(rawMarket.quoteAssetPrecision)}`),
            size_increment         : eval(`1e-${parseInt(rawMarket.baseAssetPrecision)}`),
            trade_minimum          : eval(`1e-${parseInt(rawMarket.quoteAssetPrecision)}`),
            trade_minimum_notional : 0,
        }

        const filters = rawMarket.filters;
        filters.forEach(filter => {
            switch(filter.filterType) {
                case 'PRICE_FILTER':
                    marketData.price_increment = Math.max(marketData.price_increment, parseFloat(filter.tickSize));
                    break;
                case 'LOT_SIZE':
                    marketData.trade_minimum  = Math.max(marketData.trade_minimum, parseFloat(filter.minQty));
                    marketData.size_increment = parseFloat(filter.stepSize);
                    break;
                case 'MIN_NOTIONAL':
                    marketData.trade_minimum_notional = parseFloat(filter.minNotional);
                    break;
            }
        });

        return marketData;
    }

    async getBook(connection: BinanceConnection, market: string): Promise<Book> {
        const client     = this._getClient(connection);
        const raw        = await client.bookTicker(market);

        return {
            bid: {
                price : parseFloat(raw.data.bidPrice),
                size  : parseFloat(raw.data.bidQty),
            },
            ask: {
                price : parseFloat(raw.data.askPrice),
                size  : parseFloat(raw.data.askQty),
            },
        } as Book;
    };

    async getFee(connection: BinanceConnection, market: string): Promise<Fee> {
        const client     = this._getClient(connection);
        const raw        = await client.tradeFee({ symbol: market });
        const rawData    = raw.data;
        const marketData = rawData.find(m => m.symbol == market);

        return {
            maker : parseFloat(marketData.makerCommission),
            taker : parseFloat(marketData.takerCommission),
        };
    }

    async postOrder(connection: BinanceConnection, order: Order): Promise<any> {
        const client = this._getClient(connection);
        const market = this.getMarket(connection, order.market);

        // Binance doesn't support GTT, emulate using IOC
        if (order.time_in_force == 'GTT') order.time_in_force = 'IOC';

        try {
            const orderResponse = await client.newOrder(order.market, order.side, order.type, {
                timeInForce : order.time_in_force,
                quantity    : order.size,
                price       : order.price,
            });

            // Report error
            if (orderResponse.isAxiosError) {
                console.warn('binance.postOrder', { order, response: orderResponse.data });
                return null;
            }

            // Welp, we fired.. Let's forget
            return null;
        } catch(error) {
            console.warn('binance.postOrder', { order, error, data: error.response.data });
            return null;
        }
    }

}

export const binance = new BinanceProvider();
