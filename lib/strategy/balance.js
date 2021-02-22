const Big = require('big.js');

module.exports = async (portfolio, exchange) => {
  const fees     = await exchange.getFees();
  const markets  = {};
  const accounts = {};

  // Fetch current markets
  await Promise.all(portfolio.markets.split(',').map(async marketId => {
    const [base,quote] = marketId.split('-');
    accounts[base]     = {weight:(accounts[base]||{weight:0}).weight+1};
    accounts[quote]    = {weight:(accounts[quote]||{weight:0}).weight+1};
    markets[marketId]  = await exchange.getMarket(marketId);
  }));

  const marketCount = Object.keys(markets).length;

  // Fetch accounts
  (await exchange.getAccounts())
    .forEach(account => {
      if (!(account.currency in accounts)) return false;
      accounts[account.currency] = {
        ...accounts[account.currency],
        ...account,
        value: (markets[`${account.currency}-${portfolio.baseCurrency}`]||{center:1}).center * account.available / accounts[account.currency].weight,
      };
      return true;
    });

  // Balance one market
  for(const marketId in markets) {
    const market           = markets[marketId];
    const [baseId,quoteId] = marketId.split('-');
    const base  = accounts[baseId];
    const quote = accounts[quoteId];

    // Start preparing order
    const diff  = Math.abs(base.value - quote.value);
    const order = {
      market: marketId,
      side  : base.value > quote.value ? 'sell' : 'buy',
      size  : Big(diff).times(1+(1/marketCount)).div(market.center),
    };

    // Fix size according to market
    order.size = order.size.div(market.step).round(0).times(market.step);
    if (order.size.gt(market.max)) order.size = Big(market.max);
    if (order.size.lt(market.min)) continue;

    // Trade gap to ensure profit
    const tradegap = base.available * ((fees.take) + (portfolio.tradegap/100));
    if (order.size.lt(tradegap)) continue;

    // Excute the order & bail
    const response = await exchange.postMarketOrder(order);
    if (response.message) continue;
    break;
  }
};
