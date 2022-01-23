export type Market = {
  base_min_size   : number;
  base_max_size   : number;
  base_currency   : string;
  base_increment  : number;
  quote_currency  : string;
  quote_increment : number;
  min_market_funds : number;
  max_market_funds : number;
};
