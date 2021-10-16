export { db } from './db';
export * from './abstract-entity';
export * from './repository';

import { init as initDb } from './db';

export async function init({ app }) {
  await initDb({ app });
}
