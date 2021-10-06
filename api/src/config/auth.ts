import supercop from 'supercop';

const seed = Buffer.from(process.env.AUTH_SEED || 'be2eeYei7ooYafi2meequ3ieshoofuev');

type KeyPair = {
  publicKey: string,
  secretKey: string,
  sign: (message: string) => Promise<Buffer>,
  verify: (signature: Buffer, message: string) => Promise<Boolean>,
};

type AuthType = {
  kp                 : KeyPair,
  authProperty       : string,
  accessTokenExpiry  : number,
  refreshTokenExpiry : number,
};

export const auth: AuthType = {
  kp                 : supercop.createKeyPair(seed),
  authProperty       : 'auth',
  accessTokenExpiry  : 3600,   // Access tokens expire after an hour by default
  refreshTokenExpiry : 604800, // Refresh token expire after a week by default
};

// Resolve promise
(async () => {
  auth.kp = await auth.kp;
})();
