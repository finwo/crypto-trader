import { Service } from 'typedi';
import { db } from './db';
import { toTriples, fromTriples, Triple } from '@lib/triple';
import { v4 as uuidv4 } from 'uuid';

type SearchOptions = {
  materialized ?: {[index:string]:string};
};

type SearchTriple = {
  subject   ?: string;
  predicate ?: string;
  object    ?: string | number;
};

type FreshTriple = {
  subject   ?: string;
  predicate ?: string;
  object    ?: string | number | {[index:string]:any};
};

@Service()
export class Repository<T extends {uuid?:string}> {

  constructor(
    private type: { new(): T ;}
  ) {}

  async _search(query: SearchTriple[], opts?:SearchOptions): Promise<Triple[]> {
    return new Promise((resolve, reject) => {
      db.search(query, opts, (err, triples: Triple[]) => {
        if (err) return reject(err);
        return resolve(triples);
      });
    });
  }

  _fromTriples(triples: Triple[]): {[index:string]:any}[] {
    let result = fromTriples(triples, false);

    // Typescript BS
    // We know VERY well that fromTriples will only return an array when 2nd argument = false or missing
    if (!Array.isArray(result)) {
      result = Object.values(result);
    }

    return result;
  }

  _map(data: {[index:string]:any}): T {
    const entity = new this.type();
    Object.assign(entity, data);
    return entity;
  }

  // TODO: make this more efficient
  async get(uuid: string): Promise<T> {
    const materialized = {subject:uuid,predicate:db.v('p'),object:db.v('o')};
    return this._fromTriples(await this._search([materialized], {materialized}))
      .filter(record => record.type === this.type.name)
      .map(record => this._map(record))
      .shift();
  }

  // TODO: make this more efficient
  async findOne(query: {[index:string]:any}): Promise<T> {
    const all = await this.find(query);
    return all.shift();
  }

  async find(query: {[index:string]:any}): Promise<T[]> {

    // Build search query
    const search = [{ subject: db.v('s'), predicate: 'type', object: this.type.name }];
    Object.entries(query).forEach(([key,value]) => {
      search.push({ subject: db.v('s'), predicate: key, object: value });
    });
    search.push({ subject: db.v('s'), predicate: db.v('p'), object: db.v('o') });

    // Run query & map triples into entities
    return this._fromTriples(await this._search(search, {
      materialized: {
        subject   : db.v('s'),
        predicate : db.v('p'),
        object    : db.v('o'),
      },
    })).map(record => this._map(record));
  }

  save(entity: T): Promise<T> {
    return new Promise(async (resolve, reject) => {
      entity.uuid = entity.uuid || uuidv4();
      if (await this.get(entity.uuid)) await this.remove(entity.uuid);
      const triples: FreshTriple[] = toTriples({type:this.type.name, ...entity});
      for(const triple of triples) {
        if (triple.object && 'object' === typeof triple.object) {
          if ('uuid' in triple.object) {
            triple.object = triple.object.uuid;
          } else {
            continue;
          }
        }
      }
      db.put(triples, err => {
        if (err) return reject(err);
        resolve(entity);
      });
    });
  }

  async remove(entity: string | T): Promise<boolean> {
    const id = 'string' === typeof entity ? entity : entity.uuid;
    const allRecords = await this._search([{ subject: id, predicate: db.v('p'), object: db.v('o') }], {
      materialized: { subject  : id, predicate: db.v('p'), object   : db.v('o'), },
    });
    await Promise.all(allRecords.map(triple => {
      return new Promise((resolve, reject) => {
        db.del(triple, err => {
          if (err) return reject(err);
          resolve(true);
        });
      });
    }));
    return true;
  }

}
