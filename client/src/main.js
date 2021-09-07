import root from './root.vue';
import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';

import pageHome     from './page/home.vue';
import pageLogin    from './page/login.vue';
import pageLogout   from './page/logout.vue';
import pageRegister from './page/register.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/'        ,  component: pageHome     },
    { path: '/login'   ,  component: pageLogin    },
    { path: '/logout'  ,  component: pageLogout   },
    { path: '/register',  component: pageRegister },
  ]
});

const app = createApp(root);
app.use(router);
app.mount(document.body);
