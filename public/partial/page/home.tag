<template>

</template>
<script>
  if (!app.state.loggedIn) {
    document.location.href = app.page.login;
  }
  console.log("HOME");
</script>
