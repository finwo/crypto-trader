import {uuidv4} from './uuid';

/**
 * Helper module to turn objects into triples and vice-versa
 *
 * @module helper/triple
 */

export type Triple = {
  subject: string;
  predicate: string;
  object: string|number;
  s?: string;
  p?: string;
  o?: string;
}

export function toTriples(entity: {[index:string]:any}|{[index:string]:any}[]): Triple[] {
  const triples = [];

  // Undefined/null input
  if (!entity) {
    return triples;
  }

  // Handle array input
  if (Array.isArray(entity)) {
    for(const entry of entity) {
      triples.push(...toTriples(entry));
    }
    return triples;
  }

  let cloned  = Object.assign({}, entity);
  let subject = cloned['@id'] || uuidv4();
  delete cloned['@id'];
  Object.entries(cloned).forEach(([predicate, object]) => {
    if (Array.isArray(object)) {
      object.forEach(val => {
        triples.push({subject,predicate,object:val});
      });
    } else {
      triples.push({subject,predicate,object});
    }
  });
  return triples;
}

export function fromTriples(triples: Triple[]): {[index:string]:any}[] {
  const graph = {};
  triples.forEach(triple => {
    triple.subject   = triple.subject   || triple.s;
    triple.predicate = triple.predicate || triple.p;
    triple.object    = triple.object    || triple.o;
    if (!(triple.subject in graph)) graph[triple.subject] = { '@id': triple.subject };
    if (triple.predicate in graph[triple.subject]) {
      if (!Array.isArray(graph[triple.subject][triple.predicate])) {
        graph[triple.subject][triple.predicate] = [graph[triple.subject][triple.predicate]];
      }
      graph[triple.subject][triple.predicate].push(triple.object);
    } else {
      graph[triple.subject][triple.predicate] = triple.object;
    }
  });
  return Object.values(graph);
}
