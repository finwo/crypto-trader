const supercop = require('supercop');
const b64      = require('../lib/base64url');

module.exports = async (req, res, next) => {
  try {

    // Fetch authorization token
    if (!req.headers.authorization) return next();
    let token = req.headers.authorization;
    if (token.substr(0,7).toLowerCase() !== 'bearer ') return next();
    token = token.substr(7);

    // Decode token
    let tokenparts = token.split('.');
    if (tokenparts.length != 3) return next();
    let tokenhead      = JSON.parse(b64.decode(tokenparts[0]));
    let tokenbody      = JSON.parse(b64.decode(tokenparts[1]));
    let tokensignature = b64.toBuffer(tokenparts[2]);
    let tokensigned    = [tokenparts[0],tokenparts[1]].join('.');

    // Validate token basics
    const now = Math.round(Date.now()/1000);
    if (tokenhead.alg !== 'ed25519') return next();
    if (tokenbody.iss !== 'finwo'  ) return next();
    if (tokenbody.iat >   now      ) return next();
    if (tokenbody.exp <   now      ) return next();

    // Validate signature
    if (!(await app.keypair.verify(tokensignature, tokensigned))) {
      return next();
    }

    // Signature is valid, assume data is verified from here

    // Fetch account
    const account = await app.db.models.Account.findOne({ where: { id: tokenbody.sub } });
    if (!account) {
      return next();
    }

    // Hydrate req.auth
    req.auth.ok      = true;
    req.auth.account = account;

    // Finish
    return next();
  } catch(e) {
    return next();
  }
};
