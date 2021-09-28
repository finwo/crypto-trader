import root from './root.vue';
import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';

import PageAccount    from './page/account.vue';
import PageBots       from './page/bots.vue';
import PageDashboard  from './page/dashboard.vue';
import PagePortfolios from './page/portfolios.vue';
import PageNotFound   from './page/not-found.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/'             , component: PageDashboard  },
    { path: '/account'      , component: PageAccount    },
    { path: '/bots'         , component: PageBots       },
    { path: '/dashboard'    , component: PageDashboard  },
    { path: '/portfolios'   , component: PagePortfolios },
    { path: '/:catchAll(.*)', component: PageNotFound   },
  ]
});

const app = createApp(root);
app.use(router);
app.mount(document.body);
