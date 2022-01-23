type CommonConnection = {
  provider: string;
  credentials: {[index:string]:any};
};

export type CoinbaseConnection = CommonConnection & {
  provider    : "coinbase";
  credentials : {
    key        : string;
    passphrase : string;
    secret     : string;
  }
};

export type Connection = CoinbaseConnection;
