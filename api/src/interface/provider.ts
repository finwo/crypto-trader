import { Account    } from '../type/account';
import { Book       } from '../type/book';
import { Connection } from '../type/connection';
import { Market     } from '../type/market';
import { Order      } from '../type/order';
import { Fee        } from '../type/fee';

export interface Provider {
    getAccounts(connection: Connection): Promise<Account[]>;
    getMarket(connection: Connection, market: string): Promise<Market>;
    getBook(connection: Connection, market: string): Promise<Book>;
    getFee(connection: Connection, market: string): Promise<Fee>;
    postOrder(connection: Connection, order: Order): Promise<any>;
}
