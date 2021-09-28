<template>
  <div id="layout-auth">
    <div class="content">
      <slot/>
    </div>
  </div>
</template>

<style>
#layout-auth {
  background: #0F285C;
  text-align: center;
  min-height: 100vh;
}
#layout-auth > .content {
  background: #FFF;
  margin-top: 5rem;
  margin-bottom: 5rem;
  text-align: initial;
  display: inline-block;
  padding: 2rem;
  border-radius: 0.25rem;
}
#layout-auth > .content > :first-child {
  margin-top: 0;
}
#layout-auth > .content > :last-child {
  margin-bottom: 0;
}
</style>
