type CommonConnection = {
  provider: string;
  credentials: {[index:string]:any};
};

export type BinanceConnection = CommonConnection & {
  provider    : "binance";
  credentials : {
    key    : string;
    secret : string;
  }
};

export type CoinbaseConnection = CommonConnection & {
  provider    : "coinbase";
  credentials : {
    key        : string;
    passphrase : string;
    secret     : string;
  }
};

export type Connection = BinanceConnection | CoinbaseConnection;
