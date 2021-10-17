<template>
  <router-view v-if="data && data.currentUser"/>
  <page-auth v-if="!data || !data.currentUser"/>
  <vue-notification-list position="bottom-right"></vue-notification-list>
</template>

<script lang="ts">
import { ref } from 'vue';
import { useClient, useQuery, useMutation, fetch } from "villus";
import { lock, unlock } from 'nlock';
import persist from '@appvise/persistent-object';

import PageAuth from './page/auth/index.vue';

export default {
  components: {PageAuth},
  setup() {
    const auth = persist({ store: localStorage, key: 'ctrader:auth' });

    const fetchPlugin = fetch({
      fetch: async (url, opts) => {
        // Lock, so only a single fetch runs at the same time
        // Prevents components calling urls that are not available yet due to still logging in
        await lock('villus-graphql-fetch');
        opts = opts || {};
        opts.headers = opts.headers || {};
        if (auth.accessToken && (!auth.expiresAt || (auth.expiresAt > Math.floor(Date.now() / 1000)))) {
          opts.headers['Authorization'] = 'Bearer ' + auth.accessToken;
        }
        const result = await window.fetch(url, opts);
        unlock('villus-graphql-fetch');
        return result;
      }
    });

    const endpoints = {
      'trader.finwo.net' : 'https://api.trader.finwo.net/graphql',
      'client.docker'    : 'http://api.docker/graphql',
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
            displayCurrency
            portfolio {
              uuid
            }
          }
        }
      `
    });

    const { execute: authRefresh } = useMutation(`
      mutation AuthRefresh($refreshToken: String!) {
        authRefresh(refreshToken: $refreshToken) {
          accessToken
          refreshToken
          expiresAt
        }
      }
    `);

    // Refresh token 5 minutes before it expires
    (async function refreshToken() {
      const threshold = Math.floor(Date.now() / 1000) + 300;

      // No token or no expiry = try again in a minute (for if the user logs in)
      if ((!auth.expiresAt) || (!auth.refreshToken)) {
        return setTimeout(refreshToken, 6e4);
      }

      // Wait for expiry if it's in the future
      if (auth.expiresAt > threshold) {
        await new Promise(r => setTimeout(r, (auth.expiresAt - threshold) * 1000));
      }

      // Threshold crossed, attempt token refresh
      const response = await authRefresh(auth);

      // Error = bail & try again later (should the credentials be updated)
      if (response.error) {
        return setTimeout(refreshToken, 6e4);
      }

      // Update our credentials & schedule next refresh
      Object.assign(auth, response.data.authRefresh);
      refreshToken();
    })();

    return {
      data,

      async refreshUser() {
        await refreshUser();
      },

      async logout() {
        Object.keys(auth).forEach(key => delete auth[key]);
        await this.refreshUser();
      },

    };

  },
};
</script>
