<template>
  <router-view v-if="data && data.currentUser"/>
  <page-auth v-if="!data || !data.currentUser"/>
</template>

<script lang="ts">
import { ref } from 'vue';
import { useClient, useQuery, fetch } from "villus";
import { lock, unlock } from 'nlock';

import PageAuth from './page/auth/index.vue';

export default {
  components: {PageAuth},
  setup() {
    let   auth = JSON.parse(localStorage.getItem('ctrader:auth'));

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
            displayName
          }
        }
      `
    });

    return {
      pageTitle: ref(''),
      data,

      async refreshUser() {
        auth = JSON.parse(localStorage.getItem('ctrader:auth'));
        await refreshUser();
      },

      async logout() {
        auth = {};
        localStorage.removeItem('ctrader:auth');
        await this.refreshUser();
      },
    };

  },
};
</script>
