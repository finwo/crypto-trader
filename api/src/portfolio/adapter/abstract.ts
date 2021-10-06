import { Portfolio } from '../model/portfolio';
import { Ticker } from '../model/ticker';

export type AdapterFactory = (Portfolio)=>AbstractAdapter;

const adapters: {[index:string]:AdapterFactory} = {};
export function registerAdapter(name, factory) {
  adapters[name] = factory;
}

export type ProductDescriptor = {
    id: string,
    base_currency: string;
    quote_currency: string;
    base_min_size: number;
    base_max_size: number;
    quote_increment: number;
    base_increment: number;
    display_name: string;
    min_market_funds: number;
    max_market_funds: number;
    margin_enabled: boolean;
    fx_stablecoin: boolean;
    max_slippage_percentage: number;
    post_only: boolean;
    limit_only: boolean;
    cancel_only: boolean;
    trading_disabled: boolean;
    status: string;
    status_message: string;
};

export class AbstractAdapter {

  constructor(private portfolio: Portfolio) {}
  public static instance(portfolio: Portfolio): AbstractAdapter {
    if (!adapters[portfolio.provider]) {
      throw new Error(`Unknown provider '${portfolio.provider}'`);
    }
    return adapters[portfolio.provider](portfolio);
  }

  public getProducts(): Promise<ProductDescriptor[]> {
    throw new Error("'getProucts' method has not been implemented!");
  }

  public getAccounts() {
    throw new Error("'getAccounts' method has not been implemented!");
  }

  public getTicker(product: string): Promise<Ticker> {
    throw new Error("'getTicket' method has not been implemented");
  }

}
