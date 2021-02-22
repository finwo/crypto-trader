<template>
  <page-${page}></page-${page}>
</template>
<script>
  window.app   = this;
  this.kp      = null;
  this.token   = null;
  this.account = null;

  this.dependencies = [
    'page-404',
    'page-home',
    'page-login',
    'page-portfolios',
    'page-register',
  ];

  this.route = {
    "/"          : "home",
    "/login"     : "login",
    "/portfolios": "portfolios",
    "/register"  : "register",
  };

  this.page = Object.keys(this.route).reduce((a,route) => {
    a[this.route[route]] = route;
    return a;
  },{});

  this.state = {
    page    : 'loading',
    loggedIn: false,
  };

  // Returns named fields from 
  this.formData = form => {
    return Array.from(form.querySelectorAll('[name]')).reduce((r,el) => {
      const path    = el.getAttribute('name').split('.');
      const lastkey = path.pop();
      let   ref     = r;
      while(path.length) {
        const key = path.shift();
        ref = ref[key] = ref[key] || {};
      }
      switch(el.getAttribute('type')) {
        case 'checkbox':
          ref[lastkey] = !!el.checked;
          break;
        default:
          if ((el.tagName == 'SELECT') && el.hasAttribute('multiple')) {
            ref[lastkey] = [...el.selectedOptions].map(option => option.value);
          } else {
            ref[lastkey] = el.value;
          }
          break;
      }
      return r;
    }, {});
  };

  this.arrayUnique = arr => {
    return arr.filter((e,i) => arr.indexOf(e) == i);
  };

  this.addClass = (el, cls) => {
    if (el instanceof NodeList) el = Array.from(el);
    if (Array.isArray(el)) return el.forEach(e => this.addClass(e,cls));
    const classes = el.className.split(' ');
    classes.push(cls);
    el.className = this.arrayUnique(classes).join(' ');
  };

  this.removeClass = (el, cls) => {
    if (el instanceof NodeList) el = Array.from(el);
    if (Array.isArray(el)) return el.forEach(e => this.removeClass(e,cls));
    el.className = el.className.split(' ').filter(e => e && e != cls);
  };

  this.logout = () => {
    delete localStorage['auth:email'];
    delete localStorage['auth:token'];
    delete localStorage['auth:kp'];
    document.location.reload();
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

      // Account fetch attempt
      let {account} = await api.account.me();
      if (account) {
        this.account        = account;
        this.state.loggedIn = true;
      }
    }

    // No account = broken token
    // Attempt login
    if ((!this.account) && localStorage['auth:email'] && this.kp) {
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
