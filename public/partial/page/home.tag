<template>
  <div class="container">
    <app-nav></app-nav>

    <section class="border padded">
      Total overview here, basic graph
    </section>

    <div class="right">
      <button onclick="app.openDialogCreatePortfolio();return false;">Add portfolio</button>
    </div>

    <section class="border padded">
      Portfolio
    </section>

    <section class="border padded">
      Portfolio
    </section>

  </div>

  <dialog id="dialogCreatePortfolio">
    <form>

      <div class="form-group">
        <label>Exchange</label>
        <select name="exchange">
          <option value="coinbase">Coinbase</option>
        </select>
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
  if (!app.state.loggedIn) {
    document.location.href = app.page.login;
    return;
  }

  app.openDialogCreatePortfolio = () => {
    const dialog = this.root.getElementById('dialogCreatePortfolio');
    dialog.showModal();
  };

  app.closeDialog = ctx => {
    let el = ctx;
    while(el.tagName !== 'DIALOG') el = el.parentElement;
    el.close();
  };

  console.log("HOME");
</script>
