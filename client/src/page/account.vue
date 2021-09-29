<template>
  <layout>
    <center>

      <form @submit.prevent="handleUpdateProfile()" class="inline">
        <h3>Profile</h3>
        <div class="form-group">
          <label>Display name</label>
          <input type="text" v-model="$root.data.currentUser.displayName" />
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
import { ref, getCurrentInstance, onMounted } from 'vue';
import { useMutation } from 'villus';
import { PBKDF2 } from '@appvise/digest-pbkdf2';
import { Buffer } from 'buffer';
import supercop from 'supercop';
import Layout from '../layout/dashboard.vue';

export default {
  components: {Layout},
  setup() {
    const root = getCurrentInstance().proxy.$root;
    onMounted(() => {
      root.pageTitle = 'Account';
      this.displayName = root.data.currentUser.displayName;
    });

    const UpdatePassword = `
      mutation UpdatePassword($pubkey: String!) {
        userUpdate(pubkey: $pubkey) {
          uuid
        }
      }
    `;

    const UpdateProfile = `
      mutation UpdateProfile($displayName: String) {
        userUpdate(displayName: $displayName) {
          uuid
        }
      }
    `;

    const { execute: updatePassword } = useMutation(UpdatePassword);
    const { execute: updateProfile  } = useMutation(UpdateProfile);

    return {
      password : '',
      repeat   : '',

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
        this.$router.go();
      },

      async handleUpdateProfile() {
        const response = await updateProfile({
          displayName: this.$root.data.currentUser.displayName,
        });

        if (response.error) {
          alert(response.error.message.replace(/^\[GraphQL\] /, '').replace(/\n\[GraphQL\] /g, "\n"));
          return;
        }

        this.$root.refreshUser();
        this.$router.go();
      },

      async handleDeleteAccount() {
        alert('NOT IMPLEMENTED YET');
      },

    }
  }
}
</script>
