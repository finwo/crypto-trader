<template>
  <layout-dashboard>
    <template v-slot:brand>Trader</template>
    <template v-slot:body>
      <p>
        Dashboard will eventually come here
      </p>
    </template>
  </layout-dashboard>
</template>

<script>

import LayoutDashboard from '../layout/dashboard.vue';

export default {
  components: {LayoutDashboard},
}
</script>
