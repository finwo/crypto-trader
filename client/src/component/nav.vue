<template>
  <nav :class="{ open: isOpen }" >
    <div class="profile">
      <center>
        <img src="/assets/logo.png">
        <h3>Crypto Trader</h3>
      </center>
    </div>
    <ul>
      <li><router-link to="/">Home</router-link></li>
      <li><router-link to="/login">Login</router-link></li>
    </ul>
  </nav>
  <div class="topbar">
    <a href="#!" @click.prevent="toggleMenu" v-if="isOpen"><icon>x</icon></a>
    <a href="#!" @click.prevent="toggleMenu" v-if="!isOpen"><icon>menu</icon></a>
  </div>
</template>

<style scoped>
a {
  text-decoration: none;
  color: inherit;
}
ul, li {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
ul {
  margin: 1em;
}
li a {
  padding: 0.5em;
  display: block;
}
li a:hover {
  background: #FFF4;
}
li + li {
  border-top: 1px solid #FFF4;
}
nav {
  background: #202030;
  color: #FFF;
  position: fixed;
  overflow: auto;
  left: -15rem;
  top: 0;
  height: 100vh;
  transition: left 200ms ease;
  width: 15rem;
}
nav.open {
  left: 0;
}

.profile img {
  width: 50%;
  /* border-radius: 50%; */
  margin-top: 2em;
}

.topbar {
  padding: 0.5em;
  box-shadow: 0 1px 2px #0008;
}

</style>

<style>
body {
  position: relative;
  transition: margin-left 200ms ease;
  margin-left: 0;
}
body.menuOpened {
  margin-left: 15rem;
}
</style>

<script lang="ts">

import { ref } from 'vue';
import Icon from './icon.vue';

export default {
  components: {Icon},
  setup() {
    const initialState = window.innerWidth >= 1280;
    if (initialState) {
      const bdyClassList = document.body.className.split(' ').filter(n => n && n !== 'menuOpened');
      bdyClassList.push('menuOpened');
      document.body.className = bdyClassList.join(' ');
    }
    return {
      isOpen: initialState,

      toggleMenu() {
        console.log(this.isOpen);
        this.isOpen = !this.isOpen;
        const bdyClassList = document.body.className.split(' ').filter(n => n && n !== 'menuOpened');
        if (this.isOpen) bdyClassList.push('menuOpened');
        document.body.className = bdyClassList.join(' ');
        this.$forceUpdate();
      },

    };
  }
};
</script>
