import { v4 as uuidv4 } from 'uuid';

export type Triple = {
  subject   : string;
  predicate : string;
  object    : string|number;
}

export function fromTriples(triples: Triple[], includeKeys: boolean = false): {[index:string]:any} {
  const graph = {};
  triples.forEach(triple => {
    if (!(triple.subject in graph)) graph[triple.subject] = { 'uuid': triple.subject };
    graph[triple.subject][triple.predicate] = triple.object;
  });
  return includeKeys ? graph : Object.values(graph);
}

export function toTriples(entity: {[index:string]:any}|{[index:string]:any}[]): Triple[] {
  const triples = [];
  if (Array.isArray(entity)) {
    for(const entry of entity) {
      triples.push(...toTriples(entry));
    }
    return triples;
  }
  const clone   = Object.assign({}, entity);
  const subject = entity['uuid'] || uuidv4();
  delete clone['uuid'];
  Object.entries(entity).forEach(([predicate, object]) => {
    triples.push({subject,predicate,object});
  });
  return triples;
}

// module.exports = (app) => ({

//   findQuery(params) {
//     let where  = [];
//     let layers = Object.keys(params).length;

//     if ('@id' in params) {
//       layers--;
//       where.push(`\`l${layers}\`.\`subject\` = ${helper.db.escape(params['@id'])}`);
//       delete params['@id'];
//     }

//     let select = `SELECT \`l${layers}\`.*`;
//     let from   = [`l${layers}`];

//     for(let i=0; i<layers; i++) {
//       from.push(`l${i}`);
//       where.push(`\`l${layers}\`.\`subject\` = \`l${i}\`.\`subject\``);
//     }

//     Object.entries(params).forEach(([key, value], i) => {
//       if (!Array.isArray(value)) value = [value];
//       where.push(`\`l${i}\`.\`predicate\` = ${helper.db.escape(key)}`);
//       where.push(`\`l${i}\`.\`object\` IN (${value.map(v => helper.db.escape(v)).join(',')})`);
//     });

//     return [
//       select,
//       'FROM ' + from.map(alias => `\`graph\` AS \`${alias}\``).join(', '),
//       where.length ? (
//         'WHERE ' + where.join(' AND ')
//       ) : '',
//     ].join(' ');
//   },



// });
