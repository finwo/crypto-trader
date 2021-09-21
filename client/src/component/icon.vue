<template>
  <i><slot></slot></i>
</template>

<style scoped>
  svg {
    display: inline-block;
    vertical-align: inherit;
  }
</style>

<script>
import feather from 'feather-icons';
import { getCurrentInstance, onMounted } from 'vue';

export default {
  setup() {
    let name = null;

    onMounted(() => {
      if (name) return;
      const instance           = getCurrentInstance();
      const element            = instance.vnode.el;
      name                     = element.innerHTML;
      element.dataset.feather  = name;
      feather.replace();
    });
  }
};
</script>
