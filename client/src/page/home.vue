<template>
  <div>
    <h2>Home</h2>
    Pick a category from the many to start managing.
  </div>
</template>

<script>
import requireAuthentication from '../helper/require-authentication';

export default {
  setup() {
    requireAuthentication();
  }
}
</script>
