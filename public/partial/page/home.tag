<template>
  <div class="container">
    <app-nav></app-nav>

    <section class="border padded">
      <strong>Total</strong>
      ${totals.map(total => `
        <div><strong>${total.currency}</strong> ${total.value.toFixed(2)}</div>
      `).join('')}
    </section>

    <div class="right">
      <button onclick="app.openDialogPortfolio();return false;">Add portfolio</button>
    </div>

    ${portfolios.map((portfolio,i) => `
      <section class="border padded row">
        <div class="left">
          <strong>${portfolio.name}</strong>: ${parseFloat(portfolio.value).toFixed(2)} ${portfolio.baseCurrency}
        </div>
        <div class="right">
          <button onclick="app.deletePortfolio(${i});return false;">Delete</button>
          <button onclick="app.openDialogPortfolio(${i});return false;" class="outline">Edit</button>
        </div>
      </section>
    `).join('')}

  </div>

  <dialog id="dialogPortfolio">
    <form onsubmit="app.submitPortfolio(this);return false;">
      <input name="id" class="hidden" value="-1">

      <div class="form-group">
        <label>Name</label>
        <input type="text" name="name"/>
      </div>

      <div class="form-group">
        <label>Exchange</label>
        <select name="exchange" onchange="app.updatePortfolioDynamic(this);" value="coinbase">
          <option value="coinbase" selected>Coinbase</option>
        </select>
      </div>

      <div class="form-group" exchange="coinbase">
        <label>Coinbase Key</label>
        <input type="text" name="credentials.key"/>
      </div>

      <div class="form-group" exchange="coinbase">
        <label>Coinbase Secret</label>
        <input type="text" name="credentials.secret"/>
      </div>

      <div class="form-group" exchange="coinbase">
        <label>Coinbase Passphrase</label>
        <input type="text" name="credentials.passphrase"/>
      </div>

      <div class="form-group">
        <label>Base currency</label>
        <select name="baseCurrency" value="EUR">
          <option value="EUR" selected>Euro</option>
        </select>
      </div>

      <div class="form-group">
        <label>Strategy</label>
        <select name="strategy" onchange="app.updatePortfolioDynamic(this);" value="balance">
          <option value="balance" selected>Balance</option>
        </select>
      </div>

      <div class="form-group" strategy="balance">
        <label>Trade gap &percnt;</label>
        <input name="tradegap" type="number" step="0.1" min="0.1" value="2">
      </div>

      <button class="outline" onclick="app.closeDialog(this);return false;">Cancel</button>
      <button>Submit</button>
    </form>

  </dialog>

</template>
<script>

  this.dependencies = [
    'app-nav'
  ];

  this.state = {
    portfolios: [],
    totals    : [],
  };

  if (!app.state.loggedIn) {
    document.location.href = app.page.login;
    return;
  }

  // Fetch portfolios
  (async () => {
    await new Promise(r => setTimeout(r,0));
    const {portfolios} = await api.portfolio.list();
    this.state.portfolios = portfolios || [];
    this.state.totals     = [];
    portfolios.forEach(portfolio => {
      portfolio.credentials = portfolio.credentials || {};
      let total = this.state.totals.find(t => t.currency == portfolio.baseCurrency) || {
        currency: portfolio.baseCurrency,
        value   : 0,
      }
      total.value += portfolio.value;
      if (!~this.state.totals.indexOf(total)) {
        this.state.totals[this.state.totals.length] = total;
      }
    });
  })();

  app.openDialogPortfolio = async (index = -1) => {
    let   dialog = this.root.getElementById('dialogPortfolio');
    const inputs = [...dialog.querySelectorAll('[name]')];
    if (index == -1) {
      for (const el of inputs) {
        el.value = el.getAttribute('value') || '';
      }
    } else {
      const portfolio = this.state.portfolios[index];
      for (const el of inputs) {
        const path = el.getAttribute('name').split('.');
        const last = path.pop();
        let   ref  = portfolio;
        while(path.length) {
          const key = path.shift();
          ref = ref[key] = ref[key] || {};
        }
        console.log({path,last,ref});
        if ('undefined' === typeof ref[last]) {
          continue;
        }
        el.value = ref[last];
      }
    }
    await new Promise(r => setTimeout(r,0));
    dialog = this.root.getElementById('dialogPortfolio');
    dialog.showModal();
    app.updatePortfolioDynamic(
      dialog.querySelector('[name=exchange]')
    );
  };

  app.closeDialog = ctx => {
    let el = ctx;
    while(el.tagName !== 'DIALOG') el = el.parentElement;
    el.close();
  };

  app.updatePortfolioDynamic = form => {
    while(form.tagName !== 'FORM') form = form.parentElement;
    [...form.querySelectorAll('[name]')].forEach(input => {
      const prop = input.getAttribute('name').replace(/\./g,'-');
      if (~['id','name'].indexOf(prop)) return;
      if (!input.value) return;
      if (!isNaN(input.value)) return;
      app.addClass(form.querySelectorAll(`[${prop}]`),'hidden');
      app.removeClass(form.querySelectorAll(`[${prop}=${input.value}]`),'hidden');
    });
  };

  app.submitPortfolio = async form => {
    const data = app.formData(form);
    const id   = parseInt(data.id);
    console.log({id});

    let response;
    if (id < 0) {
      delete data.id;
      response = await api.portfolio.create(data);
    } else {
      response = await api.portfolio.update(data);
    }

    const dialog = this.root.getElementById('dialogPortfolio');
    if (response.ok) {
      dialog.close();
      document.location.reload();
    } else {
      console.error(response);
    }
  };

  app.deletePortfolio = async index => {
    const portfolio = this.state.portfolios[index];
    if (!confirm(`Are you sure you want to delete your "${portfolio.name}" portfolio`)) {
      return;
    }
    const response = await api.portfolio.delete({id:portfolio.id});
    if (response.message) {
      // TODO: show error
    }
    document.location.reload();
  };

</script>
