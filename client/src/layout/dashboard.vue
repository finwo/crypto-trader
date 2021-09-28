<template>
  <c-nav />
  <div class="wrapper">
    <slot></slot>
  </div>
</template>

<style scoped>
.wrapper {
  margin: 1rem;
}
</style>

<script lang="ts">
import CNav from '../component/nav.vue';

export default {
  components: {CNav},
  emits: ['pizza'],
}
</script>
