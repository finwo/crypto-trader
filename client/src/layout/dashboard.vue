<template>
  <c-nav />
  <div class="wrapper">
    <slot />
  </div>
</template>

<style>
.wrapper {
  padding: 0.75rem 1rem;
}
.wrapper > * {
  margin: 0.75rem 1rem;
}
</style>

<script lang="ts">
import CNav from '../component/nav.vue';

export default {
  components: {CNav},
}
</script>
