const coinbase = require('../lib/coinbase');
// const {HttpOk} = app;

module.exports = [

  {
    method: 'get',
    path: '/accounts',
    name: 'accounts.get',
    async handler(req, res, next) {
      const data = (await coinbase.getAccounts())
        .filter(account => {
          account.balance   = parseFloat(account.balance);
          account.hold      = parseFloat(account.hold);
          account.available = parseFloat(account.available);
          if (account.available < 0.001) return false;
          return true;
        });
      return new app.HttpOk(data);
    },
  },

  {
    method: 'get',
    path: '/market/:id',
    name: 'market.get',
    async handler(req, res, next) {
      const marketId = req.params.id;
      return new app.HttpOk(await coinbase.getMarket(marketId));
    },
  },

];
