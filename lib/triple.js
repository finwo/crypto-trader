module.exports = (app) => ({

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

//   toTriples(params) {
//     const triples = [];
//     if (Array.isArray(params)) {
//       for(const entry of params) {
//         triples.push(...module.exports.toTriples(entry));
//       }
//       return triples;
//     }
//     let subject = params['@id'] || params['id'] || helper.uuid();
//     delete params['@id'];
//     delete params['id'];
//     Object.entries(params).forEach(([predicate, object]) => {
//       triples.push({subject,predicate,object});
//     });
//     return triples;
//   },

//   fromTriples(triples) {
//     const graph = {};
//     triples.forEach(triple => {
//       if (!(triple.subject in graph)) graph[triple.subject] = { '@id': triple.subject };
//       graph[triple.subject][triple.predicate] = triple.object;
//     });

//     return Object.values(graph);
//   },

});
