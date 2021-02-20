const supercop = require('supercop');
const b64      = require('../lib/base64url');

module.exports = [

  {
    method: 'post',
    path  : '/api/auth/login',
    name  : 'auth.login',
    async handler(req, res) {

      // Request validation
      if (!req.body.email) return new app.HttpBadRequest({ok:false,field:'email',message:'Email is missing'});
      if (!req.body.signature) return new app.HttpBadRequest({ok:false,field:'email',message:'Signature is missing'});
      if ('string' !== typeof req.body.email) return new app.HttpBadRequest({ok:false,field:'email',message:'Email is invalid'});
      if ('string' !== typeof req.body.signature) return new app.HttpBadRequest({ok:false,field:'signature',message:'Signature is invalid'});
      if (!app.regex.email.test(req.body.email)) return new app.HttpBadRequest({ok:false,field:'email',message:'Email is invalid'});

      // Fetch account
      const found = await app.db.models.Account.findOne({ where: { email: req.body.email } });
      if (!found) {
        return new app.HttpPermissionDenied({ok:false,message:'Invalid credentials'});
      }

      // Validate signature
      const pubkey    = Buffer.from(found.pubkey, 'base64');
      const signature = Buffer.from(req.body.signature, 'base64');
      if (!supercop.verify(signature, found.email, pubkey)) {
        return new app.HttpPermissionDenied({ok:false,message:'Invalid credentials'});
      }

      // Success!

      // Generate authentication token data
      const auth_time   = Math.floor(Date.now()/1000);
      const auth_header = b64.encode(JSON.stringify({alg: 'ed25519'}));
      const auth_body   = b64.encode(JSON.stringify({
        iss: 'finwo',
        iat: auth_time,
        exp: auth_time + app.config.authlen,
        sub: found.id,
      }));

      // Sign & return the token
      const auth_signed    = [auth_header,auth_body].join('.');
      const auth_signature = b64.encode(await app.keypair.sign(auth_signed));
      return new app.HttpOk({
        ok   : true,
        token: [auth_signed,auth_signature].join('.'),
      });
    },
  },

  {
    method: 'post',
    path  : '/api/auth/register',
    name  : 'auth.register',
    async handler(req, res) {

      // Request validation
      if (!req.body.email) return new app.HttpBadRequest({ok:false,field:'email',message:'Email is missing'});
      if (!req.body.pubkey) return new app.HttpBadRequest({ok:false,field:'pubkey',message:'Public key is missing'});
      if (!req.body.signature) return new app.HttpBadRequest({ok:false,field:'signature',message:'Signature is missing'});
      if ('string' !== typeof req.body.email) return new app.HttpBadRequest({ok:false,field:'email',message:'Email is invalid'});
      if ('string' !== typeof req.body.pubkey) return new app.HttpBadRequest({ok:false,field:'pubkey',message:'Public key is invalid'});
      if ('string' !== typeof req.body.signature) return new app.HttpBadRequest({ok:false,field:'signature',message:'Signature is invalid'});
      if (!app.regex.email.test(req.body.email)) return new app.HttpBadRequest({ok:false,field:'email',message:'Email is invalid'});
      // if (req.body.password.length < 8) return new app.HttpBadRequest({ok:false,field:'password',message:'Password should be equal or longer than 8 characters'});

      // Validate signature
      const pubkey    = Buffer.from(req.body.pubkey   , 'base64');
      const signature = Buffer.from(req.body.signature, 'base64');
      if (!(await supercop.verify(signature, req.body.email, pubkey))) {
        return new app.HttpBadRequest({ok:false,field:'signature',message:'Signature is invalid'});
      }

      // Check if the email not already in use
      if (await app.db.models.Account.findOne({ where: { email: req.body.email } })) {
        return new app.HttpConflict({ok:false,field:'email',message:'Email already in use'});
      }

      // Create new account
      const account = await app.db.models.Account.create({
        email : req.body.email,
        pubkey: req.body.pubkey,
      });

      // Generate authentication token data
      const auth_time   = Math.floor(Date.now()/1000);
      const auth_header = b64.encode(JSON.stringify({alg: 'ed25519'}));
      const auth_body   = b64.encode(JSON.stringify({
        iss: 'finwo',
        iat: auth_time,
        exp: auth_time + app.config.authlen,
        sub: account.id,
      }));

      // Sign & return the token
      const auth_signature = b64.encode(await app.keypair.sign([auth_header,auth_body].join('.')));
      return new app.HttpOk({
        ok   : true,
        acc  : account.id,
        token: [auth_header,auth_body,auth_signature].join('.'),
      });
    }
  },

];
