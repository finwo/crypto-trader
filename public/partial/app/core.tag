<template>
  <page-${page}></page-${page}>
</template>
<script>
  window.app = this;
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
    page    : '404',
    loggedIn: false,
  };

  if (this.route[document.location.pathname]) {
    this.state.page = this.route[document.location.pathname];
  }

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

</script>
