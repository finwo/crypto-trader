<template>
  <layout>
    <h3>Not found</h3>
    <p>
      The resource you've requested could not be found.<br/><br/>
      <router-link to="/dashboard">Click here to go to the dashboard</router-link>
    </p>
  </layout>
</template>

<script lang="ts">
import Layout from '../layout/auth.vue';
export default {
  components: {Layout},
  setup() {
    return {
      back: () => window.history.back(),
    };
  }
}
</script>
