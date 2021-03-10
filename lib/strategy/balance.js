const Big = require('big.js');

module.exports = async (portfolio, exchange) => {
  const fees     = await exchange.getFees();
  const markets  = {};
  const accounts = {};
  const strategy = portfolio.strategy;
  let   value    = 0;

  // Fetch current markets
  await Promise.all(strategy.markets.map(async marketId => {
    const [base,quote] = marketId.split('-');
    accounts[base]     = {};
    accounts[quote]    = {};
    markets[marketId]  = await exchange.getMarket(marketId);
  }));

  const marketCount = Object.keys(markets).length;

  // Fetch accounts & calculate value
  const rawAccounts = await exchange.getAccounts();
  if (!rawAccounts) return;
  rawAccounts
    .forEach(account => {
      if (!(account.currency in accounts)) return false;
      accounts[account.currency] = {
        ...accounts[account.currency],
        ...account,
        value: (markets[`${account.currency}-${portfolio.baseCurrency}`]||{center:1}).center * account.available,
      };
      value += accounts[account.currency].value;
      return true;
    });

  // Target value for each coin
  // +1 is for the baseCurrency
  let target = value / (marketCount + 1);

  // Balance one market
  for(const marketId in markets) {
    const market           = markets[marketId];
    const [baseId,quoteId] = marketId.split('-');
    const base  = accounts[baseId];
    const quote = accounts[quoteId];

    // Start preparing order
    const order = {
      market: marketId,
      side  : 'sell',
      size  : Big(base.value - target).div(market.center),
    };

    // Flip sides on negatives
    if (order.size.lt(0)) {
      order.size = order.size.abs();
      order.side = 'buy';
    }

    // Fix size according to market
    order.size = order.size.div(market.step).round(0).times(market.step);
    if (order.size.gt(market.max)) order.size = Big(market.max);
    if (order.size.lt(market.min)) continue;

    // Trade gap to ensure profit
    const tradegap = ((fees.take*2) + (strategy.tradegap/100));
    const gap      = target * tradegap / market.center;
    if (order.size.lt(gap)) continue;

    // Excute the order & bail
    const response = await exchange.postMarketOrder(order);
    if (response.message) console.log({order,...response});
  }
};
