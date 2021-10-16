const levelgraph = require('levelgraph');
const level      = require('level');

export * from './abstract-entity';
export const db = levelgraph(level(__dirname + '/../../../data'));

export async function init({ app }) {
  app.set('db', db);
  app.use((req, res, next) => {
    req.db = db;
    next();
  });
}
