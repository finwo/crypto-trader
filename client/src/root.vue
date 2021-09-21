<template>
  <router-view/>
</template>

<script>
import { getCurrentInstance } from 'vue';
import { lock, unlock } from 'nlock';
import { useClient, useQuery, fetch } from 'villus';

export default {
  setup() {
    const instance = getCurrentInstance();
    let   auth     = JSON.parse(localStorage.getItem('ctrader:auth') || '{}');

    // Injects authorization header if accesstoken present
    const fetchPlugin = fetch({
      fetch: async (url, opts) => {
        // Lock, so only a single fetch runs at the same time
        // Prevents components calling urls that are not available yet due to still logging in
        await lock('villus-graphql-fetch');
        opts = opts || {};
        opts.headers = opts.headers || {};
        if (auth.accessToken) {
          opts.headers['Authorization'] = `Bearer ${auth.accessToken}`;
        }
        const result = await window.fetch(url, opts);
        unlock('villus-graphql-fetch');
        return result;
      }
    });

    // Inject villus client
    useClient({
      use: [fetchPlugin],
      url: 'http://api.docker/graphql',
    });

    const { data, execute: refreshBasedata } = useQuery({
      query: `
        query RetreiveAuthenticationStatus {
          isAuthenticated
          currentUser {
            email
          }
        }
      `
    });

    return {
      data,
      async refreshData() {
        auth = JSON.parse(localStorage.getItem('ctrader:auth') || '{}');
        await refreshBasedata();
      },
    };
  }
}
</script>
