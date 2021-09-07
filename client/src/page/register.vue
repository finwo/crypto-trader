<template>
  <div class="wrapper">
    <h3>Register</h3>
    <form v-if="state == 0" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Email</label>
        <input v-model="data.email" type="email" required />
      </div>
      <div class="form-group">
          <label>Password</label>
        <input v-model="data.password" type="password" required />
      </div>
      <div class="form-group">
        <label>Repeat password</label>
        <input v-model="data.password_repeat" type="password" ref="password_repeat" />
      </div>
      <center class="form-group">
        <span>Already have an account? Login <router-link to="/login">here</router-link></span>
      </center>
      <div class="form-group">
        <button type="submit">Register</button>
      </div>
    </form>
    <div v-if="state >= 1">
      Generating seed
    </div>
    <div v-if="state >= 2">
      Generating key pair
    </div>
    <div v-if="state >= 3">
      Signing request
    </div>
    <div v-if="state >= 4">
      Registering
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  background: var(--col-pri-bg);
  box-shadow: var(--shadow);
  padding: 1em;
  margin: 2em auto;
  max-width: calc(60rem / 2 - 4em);
}
.form-group > * {
  display: inline-block;
  width: 100%;
}
@media screen and (max-width: 30rem) {
  .wrapper {
    max-width: 100%;
    margin: 0;
    box-shadow: unset;
  }
}
</style>

<script>

import { Buffer } from 'buffer';
import { useMutation } from 'villus';
import PBKDF2 from '../helper/pbkdf2';
import supercop from 'supercop';

console.log({Buffer});

export default {
  setup() {

    const Register = `
      mutation Register($email: String!, $pubkey: String!, $signature: String!) {
        register(email: $email, pubkey: $pubkey, signature: $signature) {
          uuid
        }
      }
    `;

    const { execute: register } = useMutation(Register);

    return {
      state: 0,

      data: {
        email: '',
        password: '',
        password_repeat: '',
      },

      async handleSubmit() {

        // Make sure the given passwords match
        if (this.data.password_repeat !== this.data.password) {
          this.$refs.password_repeat.setCustomValidity('Entered passwords do not match');
          this.$refs.password_repeat.reportValidity();
          return setTimeout(() => {
            this.$refs.password_repeat.setCustomValidity('');
          }, 100);
        }

        // Change state, so user has feedback
        this.state = 1;
        this.$forceUpdate();
        await new Promise(r => setTimeout(r,100));

        // Build seed
        const seed = Buffer.from(await (() => {
          return new Promise(done => {
            const generator = new PBKDF2(this.data.password, this.data.email, 2000, 32);
            generator.deriveKey(() => {}, done);
          });
        })(), 'hex');

        // Change state, so user has feedback
        this.state = 2;
        this.$forceUpdate();
        await new Promise(r => setTimeout(r,10));

        // Build keypair
        const keypair = await supercop.createKeyPair(seed);

        // Change state, so user has feedback
        this.state = 3;
        this.$forceUpdate();
        await new Promise(r => setTimeout(r,10));

        // Create signature
        const message   = Buffer.from(this.data.email);
        const signature = await keypair.sign(message);

        // Change state, so user has feedback
        this.state = 4;
        this.$forceUpdate();
        await new Promise(r => setTimeout(r,10));

        // Perform the registration
        this.data.pubkey    = keypair.publicKey.toString('hex');
        this.data.signature = signature.toString('hex');
        const response = await register(this.data);
        if (response.error) {
          this.state = 0;
          this.$forceUpdate();
          await new Promise(r => setTimeout(r,10));
          return alert(response.error.message.replace(/^\[GraphQL\] /, ''));
        }

        // Store authentication data
        localStorage.setItem('finwo:auth:email', this.data.email);
        localStorage.setItem('finwo:auth:pk'   , keypair.publicKey.toString('hex'));
        localStorage.setItem('finwo:auth:sk'   , keypair.secretKey.toString('hex'));

        // Navigate home
        this.$router.push('/');
      }
    };
  }
};
</script>
