<template>
  <layout>

    <div>
      <a href="#!" @click.prevent="shownModal = 'addPortfolio'" style="color:inherit;text-decoration:none;"><icon>add</icon><span>Add portfolio</span></a>
    </div>

    <div v-for="portfolio in (data && data.portfolios || [])" class="inline card" style="position:relative;min-width:20rem;">
      <h3>{{ portfolio.displayName }}</h3>
      <small>{{ portfolio.provider }}</small>
      <div style="position:absolute;top:1.5rem;right:2rem;">
        <router-link :to="`/portfolio/${portfolio.uuid}`" style="color:inherit;"><icon>edit</icon></router-link>
        <a href="#!" @click.prevent="handleDeletePortfolio(portfolio)" style="color:inherit;"><icon>delete</icon></a>
      </div>
      <div>
        Hello Text
      </div>
    </div>

  </layout>

  <modal v-if="shownModal == 'addPortfolio'" :showCloseButton="true" @close="shownModal = false" ref="modalAddPortfolio">
    <template v-slot:header>
      <h3>Add portfolio</h3>
    </template>
    <template v-slot:body>
      <form @submit.prevent="handleAddPortfolio()">
        <div class="form-group">
          <label>Name</label>
          <input type="text" v-model="pf.displayName" required />
        </div>
        <div class="form-group">
          <label>Provider</label>
          <select v-model="pf.provider" @change="$refs.modalAddPortfolio.$forceUpdate()" required>
            <option value="coinbase">CoinBase</option>
          </select>
        </div>
        <template v-if="pf.provider == 'coinbase'">
          <div class="form-group">
            <label>Passphrase</label>
            <input type="text" v-model="pf.credentials.passphrase" required />
          </div>
          <div class="form-group">
            <label>Key</label>
            <input type="text" v-model="pf.credentials.key" required />
          </div>
          <div class="form-group">
            <label>Secret</label>
            <input type="text" v-model="pf.credentials.secret" required />
          </div>
        </template>
        <div class="form-group">
          <label>&nbsp;</label>
          <button type="submit">Add portfolio</button>
        </div>
      </form>
    </template>
  </modal>
</template>

<script lang="ts">

import { ref } from 'vue';
import { useQuery, useMutation } from 'villus';
import Layout from '../../layout/dashboard.vue';
import Icon from '../../component/icon.vue';
import Modal from '../../component/modal.vue';

export default {
  components: {Layout,Icon,Modal},
  setup() {

    const { data, execute: refreshData } = useQuery({
      query: `
        query {
          portfolios {
            uuid
            displayName
            provider
          }
        }
      `
    });

    const AddPortfolio = `
      mutation AddPortfolio($displayName: String!, $provider: String!, $credentials: String!) {
        addPortfolio(displayName: $displayName, provider: $provider, credentials: $credentials) {
          uuid
        }
      }
    `;

    const RemovePortfolio = `
      mutation RemovePortfolio($uuid: ID!) {
        removePortfolio(uuid: $uuid)
      }
    `;

    const { execute: addPortfolio    } = useMutation(AddPortfolio);
    const { execute: removePortfolio } = useMutation(RemovePortfolio);

    return {
      data,
      pf: {
        displayName: '',
        provider: '',
        credentials: {},
      },
      shownModal: ref(false),
      providers: [
        { value: "coinbase", text: "coinbase" },
      ],

      async handleAddPortfolio() {
        const response = await addPortfolio({
          ...this.pf,
          credentials: JSON.stringify(this.pf.credentials),
        });

        if (response.error) {
          alert(response.error.message.replace(/^\[GraphQL\] /, '').replace(/\n\[GraphQL\] /g, "\n"));
          return;
        }

        this.shownModal = false;
        await refreshData();
      },

      async handleDeletePortfolio(portfolio) {
        if (!confirm(`Are you sure you want to remove portfolio '${portfolio.displayName}'?`)) return;

        const response = await removePortfolio({
          uuid: portfolio.uuid,
        });

        if (response.error) {
          alert(response.error.message.replace(/^\[GraphQL\] /, '').replace(/\n\[GraphQL\] /g, "\n"));
          return;
        }

        await refreshData();
      }

    };

  }
}
</script>
