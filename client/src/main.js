import root from './root.vue';
import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';

// import pageHome          from './page/home.vue';

// import pageCoursesList   from './page/courses/list.vue';
// import pageCoursesCreate from './page/courses/create.vue';
// import pageCoursesEdit   from './page/courses/edit.vue';

// import pageGroupsList    from './page/groups/list.vue';
// import pageGroupsEdit    from './page/groups/edit.vue';

// import pageTermsList     from './page/terms/list.vue';
// import pageTermsCreate   from './page/terms/create.vue';
// import pageTermsEdit     from './page/terms/edit.vue';

// import pageUsersList     from './page/users/list.vue';
// import pageUsersEdit     from './page/users/edit.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // { path: '/'              , component: pageHome          },
    // { path: '/courses'       , component: pageCoursesList   },
    // { path: '/courses/create', component: pageCoursesCreate },
    // { path: '/courses/:uuid' , component: pageCoursesEdit   },
    // { path: '/groups'        , component: pageGroupsList    },
    // { path: '/groups/:uuid'  , component: pageGroupsEdit    },
    // { path: '/terms'         , component: pageTermsList     },
    // { path: '/terms/create'  , component: pageTermsCreate   },
    // { path: '/terms/:uuid'   , component: pageTermsEdit     },
    // { path: '/users'         , component: pageUsersList     },
    // { path: '/users/:uuid'   , component: pageUsersEdit     },
  ]
});

const app = createApp(root);
app.use(router);
app.mount(document.body);
