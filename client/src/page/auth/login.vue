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
      <center class="form-group">
        <span>No account yet? <a href="#!" @click.prevent="$emit('register')">Register here</a></span><br/>
        <span><a href="#!" @click.prevent="handleForgotPassword()">Forgot password</a></span><br/>
      </center>
      <div class="form-group">
        <button type="submit">Login</button>
      </div>
    </form>
  </layout-auth>
</template>

<script lang="ts">
import LayoutAuth from '../../layout/auth.vue';

import { Buffer } from 'buffer';
import { PBKDF2 } from '@appvise/digest-pbkdf2';
import { useMutation } from 'villus';
import supercop from 'supercop';
import persist from '@appvise/persistent-object';

import { useNotificationStore } from '@dafcoe/vue-notification'
const { setNotification } = useNotificationStore()

export default {
  components: {LayoutAuth},
  emits: ['register'],
  setup() {
    const auth = persist({ store: localStorage, key: 'ctrader:auth' });

    const Login = `
      mutation Login($email: String!, $nonce: Int!, $signature: String!) {
        authLogin(email: $email, nonce: $nonce, signature: $signature) {
          accessToken
          refreshToken
          expiresAt
        }
      }
    `;

    const { execute: login } = useMutation(Login);

    return {
      alert    : (msg) => window.alert(msg),
      email    : '',
      password : '',

      async handleForgotPassword() {
        setNotification({
          message             : '"Forgot Password" has not been implemented yet',
          type                : 'alert',
          showIcon            : true,
          duration            : 4e3,
          showDurationProgress: true,
          appearance          : 'light',
          dismiss             : {
            manually      : true,
            automatically : true,
          }
        });
      },

      async handleSubmit() {
        const seed    = await new Promise(r => new PBKDF2(this.password, this.email, 1000, 32).deriveKey(()=>{},r));
        const keypair = await supercop.createKeyPair(Buffer.from(seed, 'hex'));
        const nonce   = Math.floor(Date.now() / 1000);

        // // Allow support to create pubkey (ask for pubkey in console)
        // console.log({ pubkey: keypair.publicKey.toString('hex') });

        const message   = `login|${this.email}|${nonce}`;
        const signature = await keypair.sign(message);

        const response = await login({
          email: this.email,
          nonce,
          signature: signature.toString('hex'),
        });

        console.log({response});

        if (response.error) {
          setNotification({
            message             : response.error.message.replace(/^\[GraphQL\] /, '').replace(/\n\[GraphQL\] /g, "\n"),
            type                : 'alert',
            showIcon            : true,
            duration            : 4e3,
            showDurationProgress: true,
            appearance          : 'light',
            dismiss             : {
              manually      : true,
              automatically : true,
            }
          });
          return;
        }

        // Store in localstorage & reload
        Object.assign(auth, {
          accessToken : response.data.authLogin.accessToken,
          refreshToken: response.data.authLogin.refreshToken,
          expiresAt   : response.data.authLogin.expiresAt,
        });

        this.$root.refreshUser();
      }
    }
  }
}
</script>
