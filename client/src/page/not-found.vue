<template>
  <layout>
    <p>
      The resource you've requested could not be found.<br/><br/>
      <router-link to="/dashboard">Click here to go to the dashboard</router-link>
    </p>
  </layout>
</template>

<script lang="ts">
import { getCurrentInstance, onMounted } from 'vue';
import Layout from '../layout/dashboard.vue';
export default {
  components: {Layout},
  setup() {
    const root = getCurrentInstance().proxy.$root;
    onMounted(() => {
      root.pageTitle = 'Not found';
      this.displayName = root.data.currentUser.displayName;
    });
    return {
      back: () => window.history.back(),
    };
  }
}
</script>
