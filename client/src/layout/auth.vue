<template>
  <div class="wrapper">
    <router-link to="/" class="back"><icon>arrow-left</icon>Back</router-link>
    <div class="content-wrapper">
        <h3><slot name="title"></slot></h3>
        <slot name="content"></slot>
    </div>
  </div>
</template>

<style scoped>
  .back {
    position: absolute;
    left: 1em;
    top: 1em;
    color: #FFF;
    vertical-align: middle;
    z-index: 1;
  }
  .back svg {
    margin-right: 1em;
  }
  .wrapper {
    background: #2A355E;
    color: #FFF;
    min-height: 100vh;
    min-width: 100vw;
    position: absolute;
  }
  .content-wrapper {
    padding: 1rem;
    background: #FFF;
    color: #000;
    max-width: 360px;
    margin: 5rem auto;
    border-radius: 0.5rem;
  }

  .content-wrapper > h3:first-child {
    margin-top: 0;
  }

  @media screen and (max-width: 480px) {
    .wrapper {
      background: #FFF;
    }
    .back {
      color: #000;
    }
  }
</style>

<script>
import Icon from '../component/icon.vue';
export default {
  components: {Icon},
}
</script>
