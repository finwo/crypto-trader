<template>
  <page-login    v-if="mode == 'login'"    @register="mode = 'register'" @login="mode = 'login'" />
  <page-register v-if="mode == 'register'" @register="mode = 'register'" @login="mode = 'login'" />
</template>

<script lang="ts">
import { ref } from 'vue';
import PageLogin from './login.vue';
import PageRegister from './register.vue';
export default {
  components: {
    PageLogin,
    PageRegister
  },
  setup() {
    return {
      mode: ref('login'),
    };
  }
}
</script>
