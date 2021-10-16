import { init as initAuth      } from './auth';
import { init as initPortfolio } from './portfolio';
import { init as initUser      } from './user';

export async function init({ app }) {
  await initAuth({ app });
  await initPortfolio({ app });
  await initUser({ app });
}
