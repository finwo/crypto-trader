import { Service } from 'typedi';
import { db } from './db';
import { toTriples, fromTriples } from '@lib/triple';
import { v4 as uuidv4 } from 'uuid';

@Service()
export class Repository<T extends {uuid?:string}> {

  constructor(
    private type: { new(): T ;}
  ) {}

  // TODO: make this more efficient
  async findOne(query: {[index:string]:any}): Promise<T> {
    const all = await this.find(query);
    return all.shift();
  }

  async find(query: {[index:string]:any}): Promise<T[]> {

    // Build levelgraph query
    const search = [{ subject: db.v('s'), predicate: 'type', object: this.type.name }];
    Object.entries(query).forEach(([key,value]) => {
      search.push({ subject: db.v('s'), predicate: key, object: value });
    });
    search.push({ subject: db.v('s'), predicate: db.v('p'), object: db.v('o') });

    // Go async
    return new Promise((resolve, reject) => {
      db.search(search, {
        materialized: {
          subject   : db.v('s'),
          predicate : db.v('p'),
          object    : db.v('o'),
        },
      }, (err, triples) => {
        if (err) return reject(err);
        const data = fromTriples(triples);
        resolve(data.map(entry => {
          const entity = new this.type();
          Object.assign(entity, entry);
          return entity;
        }));
      });
    });
  }

  save(entity: T): Promise<T> {
    return new Promise((resolve, reject) => {
      entity.uuid = entity.uuid || uuidv4();
      const triples = toTriples({type:this.type.name, ...entity});
      db.put(triples, err => {
        if (err) return reject(err);
        resolve(entity);
      });
    });
  }

}
