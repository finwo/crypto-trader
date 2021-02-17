module.exports = [

  {
    method: 'post',
    path  : '/api/auth/register',
    name  : 'auth.register',
    async handler(req, res) {

      // Request validation
      if (!req.body.email) return new app.HttpBadRequest({ok:false,field:'email',message:'Email is missing'});
      if (!req.body.password) return new app.HttpBadRequest({ok:false,field:'password',message:'Password is missing'});
      if ('string' !== typeof req.body.email) return new app.HttpBadRequest({ok:false,field:'email',message:'Email is invalid'});
      if ('string' !== typeof req.body.password) return new app.HttpBadRequest({ok:false,field:'password',message:'Password is invalid'});
      if (!app.regex.email.test(req.body.email)) return new app.HttpBadRequest({ok:false,field:'email',message:'Email is invalid'});
      if (req.body.password.length < 8) return new app.HttpBadRequest({ok:false,field:'password',message:'Password should be equal or longer than 8 characters'});

      // TODO: Check if email already in use

      // Create new account
      const account = await app.db.models.Account.create({
        email   : req.body.email,
        password: req.body.password,
      });

      // console.log(typeof account, account instanceof app.db.models.Account, account, account.toJSON());

      // Hide secret variables
      const accountSafe = account.toJSON();
      delete accountSafe.password;

      // TODO: create auth token

      return new app.HttpOk({
        ok: true,
        account: accountSafe,
      });
    }
  },

];
