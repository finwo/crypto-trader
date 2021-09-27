<template>
  <div>
    <h2>Users</h2>
    <table v-if="data">
      <thead>
        <tr>
          <th>Email</th>
          <th>Role</th>
          <th>
            <router-link to="/users/create"><icon>plus</icon></router-link>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in data.users">
          <td>{{ user.email }}</td>
          <td>{{ user.role  }}</td>
          <td>
            <a href="#!" @click.prevent="editUser(user)"><icon>edit</icon></a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

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
          users {
            uuid
            email
            role
          }
        }
      `
    });

    return {
      data,

      async editUser(user) {
        this.$router.push(`/users/${user.uuid}`);
      },

    };
  }
}
</script>
