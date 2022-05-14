// vim:ff=unix fdm=marker

import      { readFileSync, writeFileSync } from 'fs';
import      { observer                    } from '@finwo/observer';
import * as   providers                     from './provider';
import * as   path                          from 'path';

import { Order } from './type/order';
import { Decimal } from 'decimal.js';

const data = (() => {
  const datafile = path.resolve(__dirname + '/../../data/config.json');
  const org = JSON.parse(readFileSync(datafile).toString());
  return observer(org, () => {
    writeFileSync(datafile, JSON.stringify(org, null, 2));
  });
})();

const strategies = {
    async exchange(settings) {

        // Setup connection to provider
        // @ts-ignore
        const connection = data.connection[settings.connection];
        const provider   = providers[connection.provider];

        // Fetch the market details
        const accounts = await provider.getAccounts(connection);
        const market   = await provider.getMarket(connection, settings.market);
        const book     = await provider.getBook(connection, settings.market);
        const fees     = await provider.getFee(connection, settings.market);
        const gap      = Math.max(fees.taker * 3, settings.gap || 0);

        // Fetch quote and base accounts
        const account = {
            quote : accounts.filter(acc => acc.currency == market.quote_currency).shift(),
            base  : accounts.filter(acc => acc.currency == market.base_currency).shift(),
        };

        // Calculate cross-market values
        account.quote.balance_base = account.quote.balance / book.bid.price;
        account.base.balance_quote = account.base.balance * book.ask.price;

        // Moving target
        // Increase target by 0.1% if quote > base
        if (account.quote.balance > account.base.balance_quote) {
            settings.target *= 1.001;
        }
        // Decrease target to current value if quote < gap
        let sufficientQuoteFunds = true;
        if (account.quote.balance < (settings.target * gap)) {
            settings.target = Math.min(settings.target, account.base.balance_quote);
            sufficientQuoteFunds = false;
        }

        // Prepare orders
        const buyOrder : Partial<Order> = {market:settings.market,type:'limit',time_in_force:'GTT',cancel_after:'hour',side:'buy',post_only:false};
        const sellOrder: Partial<Order> = {market:settings.market,type:'limit',time_in_force:'GTT',cancel_after:'hour',side:'sell',post_only:false};

        // Calculate prices
        buyOrder.price  = new Decimal(settings.target).times(new Decimal(1).minus(gap)).dividedBy(account.base.balance).dividedBy(market.price_increment).floor().times(market.price_increment).toFixed();
        sellOrder.price = new Decimal(settings.target).times(new Decimal(1).plus(gap)).dividedBy(account.base.balance).dividedBy(market.price_increment).ceil().times(market.price_increment).toFixed();

        // Calculate sizes
        buyOrder.size  = new Decimal(settings.target).times(new Decimal(1).minus(gap)).times(gap).dividedBy(buyOrder.price).dividedBy(market.size_increment).round().times(market.size_increment).toFixed();
        sellOrder.size = new Decimal(settings.target).times(new Decimal(1).plus(gap)).times(gap).dividedBy(sellOrder.price).dividedBy(market.size_increment).round().times(market.size_increment).toFixed();

        // Limit price somewhat to 0.25-4.00 times the current market
        // May overshoot target
        if (parseFloat(buyOrder.price) < (book.bid.price * 0.25)) buyOrder.price = new Decimal(book.bid.price * 0.25).dividedBy(market.price_increment).round().times(market.price_increment).toFixed();
        if (parseFloat(sellOrder.price) > (book.ask.price * 4)) sellOrder.price = new Decimal(book.ask.price * 4).dividedBy(market.price_increment).round().times(market.price_increment).toFixed();

        // Check notional values
        const buyPassNotional  = new Decimal(buyOrder.size).times(buyOrder.price).gte(market.trade_minimum_notional);
        const sellPassNotional = new Decimal(sellOrder.size).times(sellOrder.price).gte(market.trade_minimum_notional);

        // console.log('main', {market, gap, buyOrder, buyPassNotional, sellOrder, sellPassNotional});

        // Cancel open orders
        await provider.cancelOpenOrders(connection, settings.market);

        // Place orders when larger than minimum
        if ((buyOrder.size  >= market.trade_minimum) && buyPassNotional && sufficientQuoteFunds) await provider.postOrder(connection, buyOrder as Order);
        if ((sellOrder.size >= market.trade_minimum) && buyPassNotional                        ) await provider.postOrder(connection, sellOrder as Order);
    }
};

// Simply calls the strategies mentioned
;(async () => {
    // @ts-ignore
    for(const bot of data.bot) {
        if (!strategies[bot.strategy]) continue;
        await strategies[bot.strategy](bot);
    }
})();
