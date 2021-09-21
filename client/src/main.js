import root from './root.vue';
import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';

import pageDashboard     from './page/dashboard.vue';
import pageHome     from './page/home.vue';
import pageLogin    from './page/login.vue';
import pageRegister from './page/register.vue';
import pageNotFound from './page/not-found.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/'             , component: pageHome      },
    { path: '/dashboard'    , component: pageDashboard },
    { path: '/login'        , component: pageLogin     },
    { path: '/register'     , component: pageRegister  },
    { path: '/:catchAll(.*)', component: pageNotFound  },
  ]
});

const app = createApp(root);
app.use(router);
app.mount(document.body);
