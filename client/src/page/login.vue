<template>
  <h2>Login</h2>
  <form @submit.prevent="handleSubmit()">
    <div class="form-group">
      <label>Email</label>
      <input type="email" v-model="email" />
    </div>
    <div class="form-group">
      <label>Password</label>
      <input type="password" v-model="password" />
    </div>
    <div class="form-group">
      <label>&nbsp;</label>
      <button type="submit">Login</button>
    </div>
  </form>
</template>

<script>

import { Buffer } from 'buffer';
import { PBKDF2 } from '@appvise/digest-pbkdf2';
import { useMutation } from 'villus';
import supercop from 'supercop';

export default {
  setup() {


    const Login = `
      mutation Login($email: String!, $nonce: Int!, $signature: String!) {
        login(email: $email, nonce: $nonce, signature: $signature) {
          accessToken
          refreshToken
          expiresAt
        }
      }
    `;

    const { execute: login } = useMutation(Login);

    return {
      async handleSubmit() {
        const seed    = await new Promise(r => new PBKDF2(this.password, this.email, 1000, 32).deriveKey(()=>{},r));
        const keypair = await supercop.createKeyPair(Buffer.from(seed, 'hex'));
        const nonce   = Math.floor(Date.now() / 1000);

        console.log({self: this});

        // Allow support to create pubkey (ask for pubkey in console)
        console.log({ pubkey: keypair.publicKey.toString('hex') });

        const message   = `login|${this.email}|${nonce}`;
        const signature = await keypair.sign(message);

        const response = await login({
          email: this.email,
          nonce,
          signature: signature.toString('hex'),
        });

        if (response.error) {
          alert(response.error.message.replace(/^\[GraphQL\] /, ''));
          return;
        }

        // Store in localstorage & reload
        localStorage.setItem('ccz-admin:auth', JSON.stringify({
          accessToken : response.data.login.accessToken,
          refreshToken: response.data.login.refreshToken,
          expiresAt   : response.data.login.expiresAt,
        }));

        this.$root.refreshUser();
      }
    }
  }
}
</script>
