<template>
  <div class="container">
    <app-nav></app-nav>

    <section class="border padded">
      Total overview here, basic graph
    </section>

    <div class="right">
      <button onclick="app.openDialogCreatePortfolio();return false;">Add portfolio</button>
    </div>

    ${portfolios.map(portfolio => `
      <section class="border padded">
        ${portfolio.name}
      </section>
    `).join('')}

  </div>

  <dialog id="dialogCreatePortfolio">
    <form onsubmit="app.submitCreatePortfolio(this);return false;">

      <div class="form-group">
        <label>Name</label>
        <input type="text" name="name"/>
      </div>

      <div class="form-group">
        <label>Exchange</label>
        <select name="exchange" onchange="app.updateCreatePortfolioExchange(this);">
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
        <label>Strategy</label>
        <select name="strategy">
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
  })();

  app.openDialogCreatePortfolio = () => {
    const dialog = this.root.getElementById('dialogCreatePortfolio');
    dialog.showModal();
    app.updateCreatePortfolioExchange(
      dialog.querySelector('[name=exchange]')
    );
  };

  app.closeDialog = ctx => {
    let el = ctx;
    while(el.tagName !== 'DIALOG') el = el.parentElement;
    el.close();
  };

  app.updateCreatePortfolioExchange = select => {
    const dialog = this.root.getElementById('dialogCreatePortfolio');
    app.addClass(dialog.querySelectorAll('[exchange]'), 'hidden');
    app.removeClass(dialog.querySelectorAll('[exchange='+(select.value)+']'), 'hidden');
    console.log({select});
  };

  app.submitCreatePortfolio = form => {
    const data = app.formData(form);
    api.portfolio.create(data);
    const dialog = this.root.getElementById('dialogCreatePortfolio');
    dialog.close();
  };



</script>
