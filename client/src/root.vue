<template>
  <f-nav />
  <div id="rt">
    Hello World
  </div>
  <!-- <nav v-if="data && data.currentUser"> -->
  <!--   <div class="f-left"> -->
  <!--     <router-link to="/">Home</router-link> -->
  <!--   </div> -->
  <!--   <div class="f-right"> -->
  <!--     <router-link to="/courses">Courses</router-link> -->
  <!--     <router-link to="/groups">Groups</router-link> -->
  <!--     <router-link to="/terms">Terms</router-link> -->
  <!--     <router-link to="/users">Users</router-link> -->
  <!--     | -->
  <!--     <a class="" href="#!" @click.prevent="logout">Logout</a> -->
  <!--   </div> -->
  <!--   <div style="clear:both;"></div> -->
  <!-- </nav> -->
  <!-- <hr v-if="data && data.currentUser" /> -->
  <!-- <router-view v-if="data && data.currentUser"></router-view> -->
  <!-- <page-login v-if="!data" /> -->
</template>

<style scoped>
#rt {
  margin: 0 auto;
  max-width: ~calc(100% - 2rem);
  width: 60rem;
}
</style>

<script lang="ts">
import { useClient, useQuery, fetch } from "villus";
import { lock, unlock } from 'nlock';

import FNav from './component/nav.vue';

export default {
  components: {FNav},
  setup() {
    let   auth     = JSON.parse(localStorage.getItem('ctrader:auth'));

    const fetchPlugin = fetch({
      fetch: async (url, opts) => {
        // Lock, so only a single fetch runs at the same time
        // Prevents components calling urls that are not available yet due to still logging in
        await lock('villus-graphql-fetch');
        opts = opts || {};
        opts.headers = opts.headers || {};
        if (auth && auth.accessToken) {
          opts.headers['Authorization'] = 'Bearer ' + auth.accessToken;
        }
        const result = await window.fetch(url, opts);
        unlock('villus-graphql-fetch');
        return result;
      }
    });

    const endpoints = {
      'client.docker' : 'http://api.docker/graphql',
    };

    useClient({
      use: [fetchPlugin],
      url: endpoints[document.location.hostname] || endpoints['default'],
    });

    const { data, execute: refreshUser } = useQuery({
      query: `
        query {
          currentUser {
            uuid
            email
          }
        }
      `
    });

    return {
      data,

      async refreshUser() {
        auth = JSON.parse(localStorage.getItem('ccz-admin:auth'));
        await refreshUser();
      },

      async logout() {
        auth = {};
        localStorage.removeItem('ccz-admin:auth');
        await this.refreshUser();
      },
    };

  },
};
</script>
