<template>
  <ul>
    <li v-if="$root.data && !$root.data.isAuthenticated"><router-link to="/login">Login</router-link></li>
    <li v-if="$root.data && !$root.data.isAuthenticated"><router-link to="/register">Register</router-link></li>
    <li v-if="$root.data && $root.data.isAuthenticated"><router-link to="/dashboard">Dashboard</router-link></li>
    <li v-if="$root.data && $root.data.isAuthenticated"><router-link to="/account">Account</router-link></li>
  </ul>
</template>

<style scoped>
 ul {
   margin: 0;
   padding: 0;
   list-style: none;
 }
 li {
   display: inline-block;
   margin: 0 1em;
   padding: 0;
 }
 a {
   color: inherit;
 }
</style>
