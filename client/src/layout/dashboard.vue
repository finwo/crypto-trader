<template>
  <c-nav />
  <div class="wrapper">
    <slot></slot>
  </div>
</template>

<style scoped>
.wrapper {
  margin: 1.5rem 2rem;
}
</style>

<script lang="ts">
import CNav from '../component/nav.vue';

export default {
  components: {CNav},
  emits: ['pizza'],
}
</script>
