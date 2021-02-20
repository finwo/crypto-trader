<template>
  <page-${page}></page-${page}>
</template>
<script>
  window.app = this;
  this.kp    = null;
  this.token = null;

  this.dependencies = [
    'page-404',
    'page-home',
    'page-login',
    'page-register',
  ];

  this.route = {
    "/"        : "home",
    "/login"   : "login",
    "/register": "register",
  };
  this.page = Object.keys(this.route).reduce((a,route) => {
    a[this.route[route]] = route;
    return a;
  },{});

  this.state = {
    page    : 'loading',
    loggedIn: false,
  };

  this.formData = form => {
    return Array.from(form.querySelectorAll('[name]')).reduce((r,el) => {
      const name = el.getAttribute('name');
      switch(el.getAttribute('type')) {
        case 'checkbox':
          r[name] = !!el.checked;
          break;
        default:
          r[name] = el.value;
          break;
      }
      return r;
    }, {});
  };

  (async () => {

    // Hydrate keypair
    if (localStorage['auth:kp']) {
      try {
        this.kp = hydrateKeyPair(JSON.parse(localStorage['auth:kp']));
      } catch(e) {
        // Intentionally blank
      }
    }

    // Fetch token to check if we're logged in
    if (localStorage['auth:token']) {
      this.token = localStorage['auth:token'];
      api.setToken(this.token);
    }

    // Account fetch attempt
    let {account} = await api.account.me();
    if (account) {
      this.account        = account;
      this.state.loggedIn = true;
    }

    // No account = broken token
    // Attempt login
    if ((!account) && localStorage['auth:email'] && this.kp) {
      const postData = {
        email    : localStorage['auth:email'],
        signature: (await this.kp.sign(localStorage['auth:email'])).toString('base64'),
      };
      const loginResponse = await api.auth.login(postData);
      if (loginResponse.ok) {
        localStorage['auth:token'] = loginResponse.token;
        api.setToken(loginResponse.token);
        // Account fetch attempt (again)
        let {account} = await api.account.me();
        if (account) {
          this.account        = account;
          this.state.loggedIn = true;
        }
      }
    }

    // Handle routing
    if (this.route[document.location.pathname]) {
      this.state.page = this.route[document.location.pathname];
    }

  })();



</script>
