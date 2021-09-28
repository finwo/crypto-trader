<template>
  <layout>
    <div>
      Pick a category from the many to start managing.
    </div>
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
