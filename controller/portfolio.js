const exchanges = require('../lib/exchange');

module.exports = [

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

      // Remove stuff that shouldn't leak
      await Promise.all(portfolios.map(async (portfolio,i) => {
        portfolio = portfolio.toJSON();
        const Exchange = exchanges[portfolio.exchange];
        const exchange = new Exchange(portfolio);
        delete portfolio.credentials;
        portfolios[i] = portfolio;
        portfolio.value = await exchange.getValue();
      }));

      return new app.HttpOk({
        ok: true,
        portfolios,
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

      console.log({portfolio});

      // // Create new account
      // const account = await app.db.models.Account.create({
      //   email : req.body.email,
      //   pubkey: req.body.pubkey,
      // });

      // // Generate authentication token data
      // const auth_time   = Math.floor(Date.now()/1000);
      // const auth_header = b64.encode(JSON.stringify({alg: 'ed25519'}));
      // const auth_body   = b64.encode(JSON.stringify({
      //   iss: 'finwo',
      //   iat: auth_time,
      //   exp: auth_time + app.config.authlen,
      //   sub: account.id,
      // }));

      // // Sign & return the token
      // const auth_signature = b64.encode(await app.keypair.sign([auth_header,auth_body].join('.')));
      // return new app.HttpOk({
      //   ok   : true,
      //   acc  : account.id,
      //   token: [auth_header,auth_body,auth_signature].join('.'),
      // });








      return new app.HttpOk({ok:true});
    },
  },
  // {
  //   method: 'get',
  //   path  : '/api/portfolio/:id',
  //   name  : 'portfolio.get',
  //   async handler(req, res) {
  //     // if (!req.auth.ok) return new app.HttpUnauthorized({ok:false,message:'Authentication required'});
  //     // return new app.HttpOk({ok:true,account:req.auth.account});
  //     return new app.HttpOk({ok:true});
  //   },
  // },


];
