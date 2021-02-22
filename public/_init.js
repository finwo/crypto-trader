const fwebc    = require('fwebc');
const rc4      = require('rc4-crypt');
const supercop = require('supercop');

window.Buffer = require('buffer').Buffer;

window.hydrateKeyPair = kp => {
  const pk = kp.pk || kp.public_key || kp.publicKey;
  const sk = kp.sk || kp.secret_key || kp.secretKey;
  return supercop.keyPairFrom({
    publicKey: Buffer.from(pk),
    secretKey: Buffer.from(sk),
  });
};

window.generateKeyPair = ({username, password}) => {
  const buf    = Buffer.alloc(Math.max(password.length,256));
  buf.write(password);
  const length = supercop.createSeed().length;
  const coder  = rc4(buf);
  const data   = username.repeat(Math.ceil(length / username.length)).substr(0,length);
  const seed   = coder(data);
  return supercop.createKeyPair(seed);
};

fwebc.load('app-core');
