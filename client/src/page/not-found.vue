<template>
  <layout-lander>
    <template v-slot:brand>Trader</template>
    <template v-slot:body>
      <p>
        Sorry, the page you are looking for does not exist
      </p>
    </template>
  </layout-lander>
</template>

<style scoped>
.left > a {
  color: inherit;
}
</style>

<script>
import LayoutLander from '../layout/lander.vue';
export default {
  components: {LayoutLander},
};
</script>
