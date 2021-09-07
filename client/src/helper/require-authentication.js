import { ref, getCurrentInstance } from 'vue';
import { useQuery } from 'villus';

export default async function(opts) {
  opts = Object.assign({
    loginUrl: '/login',
  }, opts);

  const instance = getCurrentInstance();
  const root     = instance.appContext.app._instance;
  const router   = root.proxy.$router;
  const auth     = {
    email : localStorage.getItem('finwo:auth:email'),
    pk    : localStorage.getItem('finwo:auth:pk'),
    sk    : localStorage.getItem('finwo:auth:sk'),
  };

  console.log({auth});

  if (!auth.email) {
    return router.push(opts.loginUrl);
  }
}
