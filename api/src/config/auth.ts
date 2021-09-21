import supercop from 'supercop';

const seed = Buffer.from(process.env.AUTH_SEED || 'be2eeYei7ooYafi2meequ3ieshoofuev');

type KeyPair = {
  publicKey: string,
  secretKey: string,
  sign: (message: string) => Promise<Buffer>,
  verify: (signature: Buffer, message: string) => Promise<Boolean>,
};

type AuthType = {
  kp: KeyPair,
  authProperty: string,
};

export const auth: AuthType = {
  kp: supercop.createKeyPair(seed),
  authProperty: 'auth',
};

(async () => {
  auth.kp = await auth.kp;
})();
