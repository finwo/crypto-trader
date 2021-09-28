<template>
  <layout-auth>
    <center>
      <img src="/assets/logo.png" style="width:7rem;"/>
      <h3>Crypto Trader</h3>
    </center>
    <br/>
    <form @submit.prevent="handleSubmit()">
      <div class="form-group">
        <label>Email</label>
        <input type="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" v-model="password" required />
      </div>
      <div class="form-group">
        <label>Repeat password</label>
        <input type="password" v-model="repeat" required ref="repeat" @keyup="$refs.repeat.setCustomValidity('')" />
      </div>
      <center class="form-group">
        <span>Got an account? <a href="#!" @click.prevent="$emit('login')">Login here</a></span><br/>
      </center>
      <div class="form-group">
        <button type="submit">Register</button>
      </div>
    </form>
  </layout-auth>
</template>

<script>
import LayoutAuth from '../../layout/auth.vue';

import { Buffer } from 'buffer';
import { PBKDF2 } from '@appvise/digest-pbkdf2';
import { useMutation } from 'villus';
import supercop from 'supercop';

export default {
  components: {LayoutAuth},
  emits: ['login'],
  setup() {

    const Register = `
      mutation Register($email: String!, $nonce: Int!, $signature: String!, $pubkey: String!) {
        authRegister(email: $email, nonce: $nonce, signature: $signature, pubkey: $pubkey) {
          accessToken
        }
      }
    `;

    const { execute: register } = useMutation(Register);

    return {
      email    : '',
      password : '',
      repeat   : '',

      async handleSubmit() {
        if (this.password !== this.repeat) {
          this.$refs.repeat.setCustomValidity('Passwords to not match');
          this.$refs.repeat.reportValidity();
          return;
        }

        const seed    = await new Promise(r => new PBKDF2(this.password, this.email, 1000, 32).deriveKey(()=>{},r));
        const keypair = await supercop.createKeyPair(Buffer.from(seed, 'hex'));
        const nonce   = Math.floor(Date.now() / 1000);

        // // Allow support to create pubkey (ask for pubkey in console)
        // console.log({ pubkey: keypair.publicKey.toString('hex') });

        const message   = `register|${this.email}|${nonce}`;
        const signature = await keypair.sign(message);

        const response = await register({
          pubkey: keypair.publicKey.toString('hex'),
          signature: signature.toString('hex'),
          email: this.email,
          nonce,
        });

        if (response.error) {
          alert(response.error.message.replace(/^\[GraphQL\] /, ''));
          return;
        }

        // Store in localstorage & reload
        localStorage.setItem('ctrader:auth', JSON.stringify({
          accessToken  : response.data.authRegister.accessToken,
          refreshToken : response.data.authRegister.refreshToken,
          expiresAt    : response.data.authRegister.expiresAt,
        }));

        this.$root.refreshUser();
      }
    }
  }
}
</script>
