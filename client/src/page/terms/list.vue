<template>
  <div>
    <h2>Terms</h2>
    <table v-if="data">
      <thead>
        <tr>
          <th>Name</th>
          <th>Start</th>
          <th>End</th>
          <th>
            <router-link to="/terms/create"><icon>plus</icon></router-link>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="term in data.terms">
          <td>{{ term.displayName }}</td>
          <td>{{ new Date(term.startTime * 1000).toLocaleString('nl-NL') }}</td>
          <td>{{ new Date(term.endTime * 1000).toLocaleString('nl-NL') }}</td>
          <td>
            <a href="#!" @click.prevent="editTerm(term)"><icon>edit</icon></a>
            <a href="#!" @click.prevent="deleteTerm(term)"><icon>trash</icon></a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
td > a + a {
  margin-left: 0.5em;
}
</style>

<script>

import { onMounted, onUpdated } from 'vue';
import { useQuery, useMutation } from 'villus';
import icon from '../../component/icon.vue';

export default {
  components: {icon},
  setup() {
    const { data } = useQuery({
      query: `
        query {
          terms {
            uuid
            displayName
            startTime
            endTime
          }
        }
      `
    });

    const DeleteTerm = `
      mutation DeleteTerm($uuid: ID!) {
        deleteTerm(uuid: $uuid)
      }
    `;

    const { execute } = useMutation(DeleteTerm);

    return {
      data,

      async editTerm(term) {
        this.$router.push(`/terms/${term.uuid}`);
      },

      async deleteTerm(term) {
        if (!confirm(`Delete term '${term.displayName}'?`)) return;
        const result = await execute(term);
        if (result.error) {
          // TODO: nicer error handling
          alert(result.error.message);
          return;
        }
        this.$router.go();
      }
    };
  }
}
</script>
