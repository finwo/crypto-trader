<template>
  <layout>
    <p>
      The dashboard is still under construction. Please pick a category from the menu to interact with the system.
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
      root.pageTitle = 'Dashboard';
    });
  }
}
</script>
