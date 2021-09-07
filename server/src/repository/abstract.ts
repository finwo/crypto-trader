import { uuidv4 } from '../helper/uuid';
import { fromTriples, toTriples, Triple } from '@helper';
import * as config from '@config';

interface EntityConstructor<T> {
  new(data?: {[index:string]:any}): T;
  idField: string;
}

type Callback = (err: null|undefined|Error, data?: any) => void;

type Variable = {
  name: string;
};

type GetPattern = {
  subject?: string;
  predicate?: string;
  object?: any;
};

type SearchPattern = {
  subject: string | Variable;
  predicate: string | Variable;
  object: any | Variable;
};

type SearchOptions = {
  materialized?: {[index:string]:any};
};

type Levelgraph = {
  v: (name: string) => Variable;
  search: (query: SearchPattern[], options: SearchOptions, cb: Callback) => void;
  put: (data: Triple|Triple[], cb: Callback) => void;
  del: (data: Triple|Triple[], cb: Callback) => void;
  get: (data: GetPattern, cb: Callback) => void;
}

const approot        = require('app-root-path');
const level          = require('level');
const levelgraph     = require('levelgraph');
const kv: Levelgraph = levelgraph(level(approot + '/../data'));

export class AbstractRepository<T> {
  constructor(private type: EntityConstructor<T>) {}

  getDriver(): Levelgraph {
    return kv;
  }

  find(pattern = {}, opts = {}): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const query: SearchPattern[] = [{ subject: kv.v('s'), predicate: '@type', object: this.type.name }];
      Object.entries(pattern).forEach(([key,value]) => {
        switch(key) {
          case '@id':
          case this.type.idField:
            // TODO: figure this bit out
            // query.push({
              // subject  : value,
            // });
            break;
          default:
            query.push({
              subject  : kv.v('s'),
              predicate: key,
              object   : value,
            });
            break;
        }
      });
      query.push({ subject: kv.v('s'), predicate: kv.v('p'), object: kv.v('o') });
      kv.search(query, opts, (err, triples) => {
        if (err) return reject(err);
        const entities = fromTriples(triples);
        resolve(entities.map(entity => new this.type({
          ...entity,
          [this.type.idField]: entity['@id'],
        })));
      });
    });
  }

  async get(id: string): Promise<T|null> {
    const triples: Triple[] = await new Promise((s,f) => kv.get({ subject: id }, (err,data) => err ? f(err) : s(data)));
    const [entity] = fromTriples(triples);
    if (!entity) return null;
    if (entity['@type'] !== this.type.name) return null;
    return new this.type({
      ...entity,
      [this.type.idField]: entity['@id'],
    });
  }

  async insert(entity: {[index:string]:any}|{[index:string]:any}[]): Promise<T|T[]> {
    if (Array.isArray(entity)) return entity.map(this.insert.bind(this));

    const rawData    = Object.assign({}, entity);
    rawData['@id']   = rawData[this.type.idField] || uuidv4();
    rawData['@type'] = this.type.name;
    delete rawData[this.type.idField];
    const triples = toTriples(rawData);
    const err = await new Promise(r => kv.put(triples, r));
    if (err) throw err;

    return new this.type({
      ...rawData,
      [this.type.idField]: rawData['@id']
    });

  }
}
