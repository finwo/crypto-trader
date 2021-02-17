<template>

  <div class="container">
    <div class="row">

      <div class="col"></div>
        <div class="col-2">

        <form onsubmit="app.login(this);return false;">
          <fieldset>
            <legend>Login</legend>

            <div>
              <label>Email</label>
              <input type="email" name="username" placeholder="someone@example.com">
            </div>
            <div>
              <label>Password</label>
              <input type="password" name="password" placeholder="Password">
            </div>

            <center>
              <br />
              <a href="/forgot-password">Forgot password</a>
              <br />
              <a href="/register">Create a new account</a>
              <br />
              <br />
            </center>

            <div>
              <button>Login</button>
            </div>

          </fieldset>
        </form>
      </div>
      <div class="col"></div>

    </div>
  </div>

</template>
<script>

  app.login = async form => {
    const data = app.formData(form);
    console.log({data});
  };

</script>
