<template>

  <div class="container">
    <div class="row">

      <div class="col"></div>
        <div class="col-2">

        <form onsubmit="app.register(this);return false;">
          <fieldset>
            <legend>Register</legend>

            <div>
              <label>Email</label>
              <input type="email" name="email" placeholder="someone@example.com">
            </div>
            <div>
              <label>Password</label>
              <input type="password" name="password" placeholder="Password">
            </div>
            <div>
              <label>Repeat password</label>
              <input type="password" name="password-repeat" placeholder="Repeat Password" onkeyup="app.register_validation(this);">
            </div>

            <center>
              <br />
              <a href="/login">Already have an account</a>
              <br />
              <br />
            </center>

            <div>
              <button>Register</button>
            </div>

          </fieldset>
        </form>
      </div>
      <div class="col"></div>

    </div>
  </div>

</template>
<script>

  app.register_validation = async form => {
    while(form.tagName !== 'FORM') form = form.parentElement;
    const elPass    = form.querySelector('[name=password]');
    const elPassRep = form.querySelector('[name=password-repeat]');
    const data      = app.formData(form);
    if (data['password'] === data['password-repeat']) {
      elPassRep.setCustomValidity('');
    } else {
      elPassRep.setCustomValidity('Passwords do not match');
    }
  };

  app.register = async form => {

    // Check the form
    const valid = app.register_validation(form);
    if (!valid) return form.reportValidity();
    const data = app.formData(form);

    // Generate keypair
    const kp       = await generateKeyPair({ username: data.email, password: data.password });
    const postData = {
      email: data.email,
      pubkey: kp.publicKey.toString('base64'),
      signature: (await kp.sign(data.email)).toString('base64'),
    };

    // Actually register
    const response = await api.auth.register(postData);

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


    // Success!!

    /* console.log({data,response}); */
  };

</script>
