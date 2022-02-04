// vim:ff=unix fdm=marker

import      { readFileSync, writeFileSync } from 'fs';
import      { observer                    } from '@finwo/observer';
import * as   providers                     from './provider';

import { Order } from './type/order';
import { Decimal } from 'decimal.js';

const data = (() => {
  const org = JSON.parse(readFileSync(__dirname + '/../../data/coinbase-calc.json').toString());
  return observer(org, () => {
    writeFileSync(__dirname + '/../../data/coinbase-calc.json', JSON.stringify(org, null, 2));
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
        const gap      = fees.taker * 3;

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
        if (account.quote.balance < (settings.target * gap)) {
            settings.target = Math.min(settings.target, account.base.balance_quote);
        }

        // Prepare orders
        const buyOrder: Partial<Order> = {market:settings.market,type:'limit',time_in_force:'GTT',cancel_after:'hour',side:'buy',post_only:false};
        buyOrder.price = new Decimal(settings.target).times(new Decimal(1).minus(gap)).dividedBy(account.base.balance).dividedBy(market.quote_increment).round().times(market.quote_increment).toFixed();
        // buyOrder.price = Math.floor((settings.target * (1 - gap) / account.base.balance) / market.quote_increment) * market.quote_increment;
        buyOrder.size = new Decimal(settings.target).times(new Decimal(1).minus(gap)).times(gap).dividedBy(buyOrder.price).dividedBy(market.base_increment).round().times(market.base_increment).toFixed();
        // buyOrder.size  = Math.floor(((settings.target * (1 - gap) * gap) / buyOrder.price) / market.base_increment ) * market.base_increment;
        const sellOrder: Partial<Order> = {market:settings.market,type:'limit',time_in_force:'GTT',cancel_after:'hour',side:'sell',post_only:false};
        sellOrder.price = new Decimal(settings.target).times(new Decimal(1).plus(gap)).dividedBy(account.base.balance).dividedBy(market.quote_increment).round().times(market.quote_increment).toFixed();
        // sellOrder.price = Math.floor((settings.target * (1 + gap) / account.base.balance) / market.quote_increment) * market.quote_increment;
        sellOrder.size = new Decimal(settings.target).times(new Decimal(1).plus(gap)).times(gap).dividedBy(sellOrder.price).dividedBy(market.base_increment).round().times(market.base_increment).toFixed();
        // sellOrder.size  = Math.floor(((settings.target * (1 + gap) * gap) / sellOrder.price) / market.base_increment ) * market.base_increment;

        // Place orders
        const buyResponse  = await provider.postOrder(connection, buyOrder as Order);
        const sellResponse = await provider.postOrder(connection, sellOrder as Order);

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
