type CommonOrder = {
  market : string;
  type   : string;
  side   : "buy" | "sell";
};

export type LimitOrder = CommonOrder & {
  type           : "limit";
  price          : number | string;
  size           : number | string;
  time_in_force ?: "GTC" | "GTT";
  cancel_after  ?: "min" | "hour" | "day";
  post_only     ?: boolean;
};

export type LimitExpiringOrder = LimitOrder & {
  time_in_force : "GTT";
  cancel_after  : "min" | "hour" | "day";
}

export type Order = LimitOrder | LimitExpiringOrder;
