import root from './root.vue';
import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';

import PageAccount    from './page/account.vue';
import PageBots       from './page/bots.vue';
import PageDashboard  from './page/dashboard.vue';
import PagePortfolios from './page/portfolio/index.vue';
import PageNotFound   from './page/not-found.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/'             , component: PageDashboard , name: 'Dashboard' , meta: { nav: true , icon: 'dashboard'              } },
    { path: '/portfolio'    , component: PagePortfolios, name: 'Portfolios', meta: { nav: true , icon: 'account_balance_wallet' } },
    { path: '/bots'         , component: PageBots      , name: 'Bots'      , meta: { nav: true , icon: 'smart_toy'              } },
    { path: '/account'      , component: PageAccount   , name: 'Account'   , meta: { nav: true , icon: 'person'                 } },
    { path: '/:catchAll(.*)', component: PageNotFound  , name: 'Not Found' , meta: { nav: false, icon: 'error'                  } },
  ]
});

const app = createApp(root);
app.use(router);
app.mount(document.body);
