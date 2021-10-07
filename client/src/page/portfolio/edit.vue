<template>
  <layout>
    <form>
      {{ data && data.portfolio.displayName }}
    </form>
  </layout>
</template>

<script lang="ts">
import { getCurrentInstance } from 'vue';
import { useQuery } from 'villus';
import Layout from "../../layout/dashboard.vue";

export default {
  components: {Layout},
  setup() {
    const ctx = getCurrentInstance().proxy;
    const { data, execute: refreshData } = useQuery({
      variables: ctx.$route.params,
      query: `
        query FetchPortfolio($uuid: ID!) {
          portfolio(uuid: $uuid) {
            uuid
            displayName
            provider
          }
        }
      `,
    });

    return {
      data
    };
  },
}
</script>
