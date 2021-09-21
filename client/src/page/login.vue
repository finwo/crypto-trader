<template>
  <layout-auth>
    <template v-slot:title>Login</template>
    <template v-slot:content>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="email">
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" v-model="password">
        </div>
        <center>
          <br/>
          No account yet? <router-link to="/register">Register here</router-link><br/>
          Forgot password? <router-link to="/forgot-password">Reset password</router-link>
        </center>
        <div class="form-group">
          <label>&nbsp;</label>
          <button type="submit">Login</button>
        </div>
      </form>
    </template>
  </layout-auth>
</template>

<script>
import { Buffer } from 'buffer';
import { getCurrentInstance } from 'vue';
import { useMutation } from 'villus';
import LayoutAuth from '../layout/auth.vue';

import supercop from 'supercop';
import { PBKDF2 } from '../component/pbkdf2';

export default {
  components: {LayoutAuth},
  setup() {
    const ctx = getCurrentInstance().proxy;

    const { execute: login } = useMutation(`
      mutation Login($email: String!, $nonce: Int!, $signature: String!) {
        authLogin(email: $email, nonce: $nonce, signature: $signature) {
          accessToken
        }
      }
    `);

    return {
      email    : null,
      password : null,

      async handleLogin() {
        const seed      = await new Promise(r => (new PBKDF2(ctx.password, ctx.email, 1000, 32)).deriveKey(()=>{}, r));
        const keypair   = await supercop.createKeyPair(Buffer.from(seed,'hex'));
        const nonce     = Math.floor(Date.now() / 1000);
        const signature = await keypair.sign(`login|${ctx.email}|${nonce}`);

        const response = await login({
          signature : signature.toString('hex'),
          email     : ctx.email,
          nonce,
        });

        if (response.error) {
          alert(response.error.message.replace(/^\[GraphQL\] /g, ''));
          return;
        }

        localStorage.setItem('ctrader:auth', JSON.stringify({
          email       : ctx.email,
          pk          : keypair.publicKey.toString('hex'),
          sk          : keypair.secretKey.toString('hex'),
          accessToken : response.data.authLogin.accessToken,
        }));

        await ctx.$root.refreshData();
        ctx.$router.push('/dashboard');
      }
    };
  }
}
</script>
