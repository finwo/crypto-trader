<template>
  <layout>
    <center>

      <form @submit.prevent="handleUpdatePreferences()" class="inline">
        <h3>Preferences</h3>
        <div class="form-group">
          <label>Display name</label>
          <input type="text" v-model="$root.data.currentUser.displayName" />
        </div>
        <div class="form-group">
          <label>Display currency</label>
          <vue-select
            v-model="$root.data.currentUser.displayCurrency"
            :options="displayCurrency"
            label-by="text"
            value-by="value"
            :close-on-select="true"
            :placeholder="$root.data.currentUser.displayCurrency"
            :searchable="true"
            :clear-on-select="true"
          />
        </div>
        <div class="form-group">
          <label>&nbsp;</label>
          <button type="submit">Update</button>
        </div>
      </form>

      <form @submit.prevent="handleUpdatePassword()" class="inline">
        <h3>Update password</h3>
        <div class="form-group">
          <label>Password</label>
          <input type="password" v-model="password" required />
        </div>
        <div class="form-group">
          <label>Repeat password</label>
          <input type="password" v-model="repeat" required ref="repeat" @keyup="$refs.repeat.setCustomValidity('')" />
        </div>
        <div class="form-group">
          <label>&nbsp;</label>
          <button type="submit">Update</button>
        </div>
      </form>

      <form @submit.prevent="handleDeleteAccount()" class="inline">
        <h3>Delete account</h3>
        <div class="form-group">
          <label>&nbsp;</label>
          <button type="submit" class="danger">Delete account</button>
        </div>
      </form>

    </center>
  </layout>
</template>

<style scoped>
form {
  margin: 1rem;
  vertical-align: top;
}
</style>

<script lang="ts">
import { useMutation } from 'villus';
import { PBKDF2 } from '@appvise/digest-pbkdf2';
import { Buffer } from 'buffer';
import supercop from 'supercop';
import Layout from '../layout/dashboard.vue';

import 'vue-next-select/dist/index.min.css';
import VueSelect from 'vue-next-select';

export default {
  components: {Layout,VueSelect},
  setup() {

    const UpdatePassword = `
      mutation UpdatePassword($pubkey: String!) {
        userUpdate(pubkey: $pubkey) {
          uuid
        }
      }
    `;

    const UpdatePreferences = `
      mutation UpdatePreferences($displayName: String, $displayCurrency: String) {
        userUpdate(displayName: $displayName, displayCurrency: $displayCurrency) {
          uuid
        }
      }
    `;

    const { execute: updatePassword    } = useMutation(UpdatePassword);
    const { execute: updatePreferences } = useMutation(UpdatePreferences);

    return {
      password : '',
      repeat   : '',
      displayCurrency: [
        { text: 'BTC - Bitcoin'  , value: 'BTC' },
        { text: 'EUR - Euro'     , value: 'EUR' },
        { text: 'USD - US Dollar', value: 'USD' },
      ],

      async handleUpdatePassword() {
        if (this.password !== this.repeat) {
          this.$refs.repeat.setCustomValidity('Passwords to not match');
          this.$refs.repeat.reportValidity();
          return;
        }

        const seed    = await new Promise(r => new PBKDF2(this.password, this.$root.data.currentUser.email, 1000, 32).deriveKey(()=>{},r));
        const keypair = await supercop.createKeyPair(Buffer.from(seed, 'hex'));

        // // Allow support to create pubkey (ask for pubkey in console)
        // console.log({ pubkey: keypair.publicKey.toString('hex') });

        const response = await updatePassword({
          pubkey: keypair.publicKey.toString('hex'),
        });

        if (response.error) {
          alert(response.error.message.replace(/^\[GraphQL\] /, '').replace(/\n\[GraphQL\] /g, "\n"));
          return;
        }

        this.$root.refreshUser();
        // this.$router.go();
      },

      async handleUpdatePreferences() {
        const response = await updatePreferences({
          displayName    : this.$root.data.currentUser.displayName,
          displayCurrency: this.$root.data.currentUser.displayCurrency,
        });

        if (response.error) {
          alert(response.error.message.replace(/^\[GraphQL\] /, '').replace(/\n\[GraphQL\] /g, "\n"));
          return;
        }

        this.$root.refreshUser();
      },

      async handleDeleteAccount() {
        alert('NOT IMPLEMENTED YET');
      },

    }
  }
}
</script>
