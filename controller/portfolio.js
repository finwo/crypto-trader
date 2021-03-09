const exchanges = require('../lib/exchange');

module.exports = [

  {
    method: 'put',
    path  : '/api/portfolio/:id',
    name  : 'portfolio.update',
    async handler(req, res) {
      if (!req.auth.ok) return new app.HttpUnauthorized({ok:false,message:'Authentication required'});

      // Fetch portfolio
      const portfolio = await app.db.models.Portfolio.findOne({
        where: {
          id     : req.params.id,
          account: req.auth.account.id,
        },
      });

      if (!portfolio) {
        return new app.HttpNotFound({
          ok     : false,
          message: 'Portfolio not found',
        });
      }

      // Merge credentials
      const credentials = JSON.parse(portfolio.credentials);
      Object.assign(credentials,req.body.credentials);
      portfolio.credentials = JSON.stringify(credentials);

      // Merge strategy
      const strategy = JSON.parse(portfolio.strategy);
      Object.assign(strategy,req.body.strategy);
      portfolio.strategy = JSON.stringify(strategy);

      // Merge new data
      for(const key in req.body) {
        if (~['credentials','strategy','id'].indexOf(key)) continue;
        portfolio[key] = req.body[key] || portfolio[key];
      }

      // Save and be done
      await portfolio.save();

      return new app.HttpOk({
        ok: true,
      });
    },
  },

  {
    method: 'delete',
    path  : '/api/portfolio/:id',
    name  : 'portfolio.delete',
    async handler(req, res) {
      if (!req.auth.ok) return new app.HttpUnauthorized({ok:false,message:'Authentication required'});

      // Fetch portfolio
      const portfolio = await app.db.models.Portfolio.findOne({
        where: {
          id     : req.params.id,
          account: req.auth.account.id,
        },
      });

      // Handle not-found
      if (!portfolio) {
        return new app.HttpNotFound({
          ok     : false,
          message: 'Portfolio not found',
        });
      }

      // Delete the portfolio
      await portfolio.destroy();

      return new app.HttpOk({
        ok: true,
      });
    },
  },

  {
    method: 'post',
    path  : '/api/portfolio',
    name  : 'portfolio.create',
    async handler(req, res) {
      if (!req.auth.ok) return new app.HttpUnauthorized({ok:false,message:'Authentication required'});

      const data = {
        ...req.body,
        account: req.auth.account.id,
      };
      delete data.id;

      // Basic validation
      if (!data.name) return new app.HttpBadRequest({ok:false,field:'name',message:'Name Missing'});
      if (!data.exchange) return new app.HttpBadRequest({ok:false,field:'exchange',message:'Exchange Missing'});
      if (!data.credentials) return new app.HttpBadRequest({ok:false,message:'Credentials Missing'});
      if (!data.strategy) return new app.HttpBadRequest({ok:false,field:'strategy',message:'Strategy Missing'});
      if ('string' !== typeof data.name) return new app.HttpBadRequest({ok:false,field:'name',message:'Invalid Name'});
      if ('string' !== typeof data.exchange) return new app.HttpBadRequest({ok:false,field:'exchange',message:'Invalid Exchange'});
      if ('object' !== typeof data.credentials) return new app.HttpBadRequest({ok:false,field:'credentials',message:'Invalid Credentials'});
      if ('string' !== typeof data.strategy) return new app.HttpBadRequest({ok:false,field:'strategy',message:'Invalid Strategy'});

      console.log({data});

      // Strategy validation
      switch(data.strategy) {
        case 'balance':
          if (!data.tradegap) return new app.HttpBadRequest({ok:false,field:'tradegap',message:'Tradegap Missing'});
          if (isNaN(data.tradegap)) return new app.HttpBadRequest({ok:false,field:'tradegap',message:'Invalid Tradegap'});
          data.tradegap = parseFloat(data.tradegap);
          break;
        default:
          return new app.HttpBadRequest({ok:false,field:'strategy',message:'Invalid Strategy'});
      }

      // Exchange validation
      if (!(data.exchange in exchanges)) {
        return new app.HttpBadRequest({ok:false,field:'exchange',message:'Invalid Exchange'});
      }

      // Validation by exchange
      const exchange = exchanges[data.exchange];
      const exchangeReject = await exchange.validatePortfolio(data);
      if (exchangeReject) {
        return new app.HttpBadRequest({
          ok     : false,
          message: exchangeReject,
        });
      }

      // All checks passed, will create the portfolio
      const portfolio = await app.db.models.Portfolio.create({
        ...data,
        credentials: JSON.stringify(data.credentials),
      });

      return new app.HttpOk({ok:true});
    },
  },

  {
    method: 'get',
    path  : '/api/portfolio',
    name  : 'portfolio.list',
    async handler(req, res) {
      if (!req.auth.ok) return new app.HttpUnauthorized({ok:false,message:'Authentication required'});

      // Fetch portfolios
      const portfolios = await app.db.models.Portfolio.findAll({
        where: {
          account: req.auth.account.id,
        },
      });

      // Remove stuff that shouldn't leak & calculate value
      await Promise.all(portfolios.map(async (portfolio,i) => {
        portfolio = portfolio.toJSON();
        const Exchange = exchanges[portfolio.exchange];
        const exchange = new Exchange(portfolio);
        delete portfolio.credentials;
        portfolios[i]        = portfolio;
        portfolio.value      = await exchange.getValue();
        portfolio.allMarkets = (await exchange.getMarkets()).filter(market => market.quote == portfolio.baseCurrency);
        portfolio.strategy   = JSON.parse(portfolio.strategy);
        portfolio.allMarkets.sort((a,b) => a.id > b.id ? 1 : (a.id < b.id ? -1 : 0));
      }));

      return new app.HttpOk({
        ok: true,
        portfolios,
      });
    },
  },

];
