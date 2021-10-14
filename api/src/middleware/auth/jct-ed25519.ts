import base64url from 'base64url';
import { Request, Response } from 'express';
import * as config from '@config';

export async function init({ app }) {
  app.use(async (req: Request, res: Response, next) => {

    // Fetch token from headers
    if (!('authorization' in req.headers)) return next();
    const [type, ...sections] = req.headers.authorization.split(' ');
    if (type.toLowerCase() !== 'bearer') return next();
    const tokenRaw = sections.join(' ');

    // Split into header, body & signature
    const [headerRaw,bodyRaw,signatureRaw,...remainder] = tokenRaw.split('.');
    if (remainder.length) return next();
    if ((!headerRaw)||(!bodyRaw)||(!signatureRaw)) return next();
    const header: any = JSON.parse(base64url.decode(headerRaw));
    const body  : any = JSON.parse(base64url.decode(bodyRaw));
    const signature = base64url.toBuffer(signatureRaw);
    if ((!header)||(!body)||(!signature)) return next();

    // Verify header
    if (header.typ !== 'jct') return next(); // json custom token
    if (header.alg !== 'ed25519') return next();

    // Verify expiry & nbf/iat
    const now = Math.floor(Date.now() / 1000);
    if (!body.exp) return next();
    if (body.exp < now) return next();
    if (body.iat && (body.iat > now)) return next();
    if (body.nbf && (body.nbf > now)) return next();

    // Verify signature
    if (!await config.auth.kp.verify(signature, `${headerRaw}.${bodyRaw}`)) return next();

    // Signature verified here, assume we created it outselves
    Object.defineProperty(req, config.auth.authProperty, {
      configurable: false,
      enumerable  : true,
      writable    : false,
      value       : body,
    });

    next();
  });
};
