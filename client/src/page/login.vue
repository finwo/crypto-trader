<template>
  <form class="wrapper" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label>Email</label>
      <input v-model="email" type="email" />
    </div>
    <div class="form-group">
      <label>Password</label>
      <input v-model="password" type="password" />
    </div>
    <center class="form-group">
      <span>No account yet? Register <router-link to="/register">here</router-link></span>
      <span><router-link to="/forgot-password">Forgot password</router-link></span>
    </center>
    <div class="form-group">
      <button type="submit">Login</button>
    </div>
  </form>
</template>

<style scoped>
.wrapper {
  background: var(--col-pri-bg);
  box-shadow: var(--shadow);
  padding: 1em;
  margin: 2em auto;
  max-width: calc(60rem / 2 - 4em);
}
.form-group > * {
  display: inline-block;
  width: 100%;
}
label + input {
  margin-top: 0.5em;
}
</style>

<script>
export default {
  setup() {
    return {
      handleSubmit() {
        console.log(this);
      }
    };
  }
};
</script>
