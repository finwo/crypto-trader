<template>
  <router-view></router-view>
</template>

<script>
import icon from 'component/icon.vue';
// import { getCurrentInstance, onUpdated } from 'vue';
import { useClient, fetch } from "villus";
import { lock, unlock } from 'nlock';

export default {
  components: {icon},
  setup() {

    // const instance = getCurrentInstance();
    const auth        = {accessToken:null};
    const fetchPlugin = fetch({
      fetch: async (url, opts) => {
        // Lock, so only a single fetch runs at the same time
        // Prevents components calling urls that are not available yet due to still logging in
        await lock('villus-graphql-fetch');
        opts = opts || {};
        opts.headers = opts.headers || {};
        if (auth.accessToken) {
          opts.headers['Authorization'] = auth.accessToken;
        }
        const result = await window.fetch(url, opts);
        unlock('villus-graphql-fetch');
        return result;
      }
    });

    useClient({
      use: [fetchPlugin],
      // url: "https://run-ccz-api-test-oni3kypyva-ez.a.run.app/graphql"
      url: "http://localhost:3000/graphql"
    });

    // const { data, execute } = useQuery({
    //   fetchOnMount: false,
    //   query: `
    //     query {
    //       login(email: "robin@app-vise.nl", password: "changeme") {
    //         accessToken
    //         refreshToken
    //         expiresAt
    //       }
    //     }
    //   `
    // });

    // function resultHandler(result) {
    //   if (result.data) {
    //     auth.accessToken  = result.data.login.accessToken;
    //     auth.refreshToken = result.data.login.refreshToken;
    //     auth.expiresAt    = result.data.login.expiresAt;
    //   }
    //   localStorage.setItem('cczAdmin:accessToken', auth.accessToken);
    //   instance.proxy.$forceUpdate();
    // }

    // execute().then(resultHandler);
    // return {data};
  },
};
</script>
