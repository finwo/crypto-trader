<template>
  <layout-dashboard>
    <template v-slot:brand>Trader</template>
    <template v-slot:body>
      <p>
        Logged in as: {{ $root && $root.data && ($root.data.currentUser.displayName || $root.data.currentUser.email) }}
        <br />
        <button @click.prevent="handleLogout">Logout</button>
      </p>
    </template>
  </layout-dashboard>
</template>

<script>

import { getCurrentInstance } from 'vue';
import LayoutDashboard from '../layout/dashboard.vue';

export default {
  components: {LayoutDashboard},
  setup() {
    const ctx = getCurrentInstance().proxy;
    return {
      async handleLogout() {
        localStorage.removeItem('ctrader:auth');
        await ctx.$root.refreshData();
        ctx.$router.push('/');
      }
    }
  }
}
</script>
