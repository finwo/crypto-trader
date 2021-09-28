<template>
  <layout>
    <div>
      Bots management page
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
      root.pageTitle = 'Bots';
    });
  }
}
</script>
