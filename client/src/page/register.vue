<template>
  <layout-auth>
    <template v-slot:title>Register</template>
    <template v-slot:content>
      <form @submit.prevent="handleRegister()">
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="email" required>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" v-model="password" required>
        </div>
        <div class="form-group">
          <label>Repeat password</label>
          <input type="password" v-model="password_repeat" ref="password_repeat" @keyup="$refs.password_repeat.setCustomValidity('')" required>
        </div>
        <center>
          <br/>
          Already have an account? <router-link to="/login">Login here</router-link>
        </center>
        <div class="form-group">
          <label>&nbsp;</label>
          <button>Register</button>
        </div>
      </form>
    </template>
  </layout-auth>
</template>

<script>
import { Buffer } from 'buffer';
import { getCurrentInstance } from 'vue';
import { useQuery, useMutation } from 'villus';
import LayoutAuth from '../layout/auth.vue';

import supercop from 'supercop';
import { PBKDF2 } from '../component/pbkdf2';

export default {
  components: {LayoutAuth},
  setup() {
    const ctx = getCurrentInstance().proxy;

    const { execute: emailExists } = useQuery({
      fetchOnMount: false,
      query: `
        mutation EmailExists($email: String!) {
          emailExists(email: $email)
        }
      `
    });

    const { execute: register } = useMutation(`
      mutation Register($email: String!, $nonce: Int!, $pubkey: String!, $signature: String!) {
        authRegister(email: $email, nonce: $nonce, pubkey: $pubkey, signature: $signature) {
          accessToken
        }
      }
    `);

    return {
      email           : null,
      password        : null,
      password_repeat : null,

      async handleRegister() {
        if (ctx.password !== ctx.password_repeat) {
          ctx.$refs.password_repeat.setCustomValidity('Passwords do not match');
          ctx.$refs.password_repeat.reportValidity();
          return;
        }

        const seed      = await new Promise(r => (new PBKDF2(ctx.password, ctx.email, 1000, 32)).deriveKey(()=>{}, r));
        const keypair   = await supercop.createKeyPair(Buffer.from(seed,'hex'));
        const nonce     = Math.floor(Date.now() / 1000);
        const signature = await keypair.sign(`register|${ctx.email}|${nonce}`);

        const response = await register({
          pubkey    : keypair.publicKey.toString('hex'),
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
          accessToken : response.data.authRegister.accessToken,
        }));

        await ctx.$root.refreshData();
        ctx.$router.push('/dashboard');
      }
    };
  }
}
</script>
