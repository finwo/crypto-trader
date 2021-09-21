<template>
  <header>
    <div class="content">
      <div class="left">
        <router-link to="/">
          <slot name="brand">Brand</slot>
        </router-link>
      </div>
      <div class="grow"></div>
      <nav-user class="right"/>
      <div class="clearfix"></div>
    </div>
  </header>
  <main>
    <div class="content">
      <slot name="body"></slot>
    </div>
  </main>
</template>

<style scoped>
  header .content {
    height: 3rem;
    display: flex;
    align-items: center;
    flex-direction: row;
  }
  .grow {
    flex-grow: 1;
  }
  .content {
    margin: 0 auto;
    width: calc(768px - 2rem);
    max-width: calc(100% - 2rem);
  }
  .left {
    display: block;
    float: left;
    font-weight: 500;
    margin: 0;
    font-size: 1.17rem;
  }
  .left a {
    color: inherit;
  }
  .right {
    display: block;
    float: right;
  }
  .clearfix {
    clear: both;
  }
  @media screen and (max-width: 480px) {
    header .content {
      display: block;
    }
    .left,
    .right {
      text-align: center;
      float: unset;
    }
  }
</style>

<script>
import NavUser from '../component/nav-user.vue';
export default {
  components: {NavUser}
}
</script>
