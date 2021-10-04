<template>
  <layout>
    <p>
      The resource you've requested could not be found.<br/><br/>
      <router-link :to="$router.resolve({ name: 'Dashboard' })">Click here to go to the dashboard</router-link>
    </p>
  </layout>
</template>

<script lang="ts">
import Layout from '../layout/dashboard.vue';
export default {
  components: {Layout},
  setup() {
    return {
      back: () => window.history.back(),
    };
  }
}
</script>
