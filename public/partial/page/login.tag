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
              <input type="email" name="email" placeholder="someone@example.com">
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

    // Generate keypair
    const kp       = await generateKeyPair({ username: data.email, password: data.password });
    const postData = {
      email: data.email,
      signature: (await kp.sign(data.email)).toString('base64'),
    };

    // Actually perform login
    const response = await api.auth.login(postData);

    // Handle error
    if ((!response.ok) && response.field) {
      // TODO: handle error without field
      form.querySelector(`[name=${response.field}]`).setCustomValidity(response.message);
      form.reportValidity();
      return setTimeout(() => {
        form.querySelector(`[name=${response.field}]`).setCustomValidity('');
      }, 5000);
    }

    // Fetch authentication token
    localStorage['auth:email'] = data.email;
    localStorage['auth:kp']    = JSON.stringify(kp);
    localStorage['auth:token'] = response.token;
    api.setToken(response.token);

    // Redirect home
    document.location.href = app.page.home;
  };

</script>
