import { init as initAuth } from './auth';
import { init as initUser } from './user';

export async function init({ app }) {
  await initAuth({ app });
  await initUser({ app });
}
