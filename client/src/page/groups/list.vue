<template>
  <div>
    <h2>Groups</h2>
    <table v-if="data">
      <thead>
        <tr>
          <th>Year</th>
          <th>Name</th>
          <th>Courses</th>
          <th>Users</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="group in data.groups">
          <td>{{ group.schoolYear }}</td>
          <td>{{ group.name }}</td>
          <td>{{ (group.coursesAvailable||[]).length }}</td>
          <td>{{ (group.users||[]).length }}</td>
          <td>
            <a href="#!" @click.prevent="editGroup(group)"><icon>edit</icon></a>
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
          groups {
            uuid
            schoolYear
            name
            coursesAvailable { uuid }
            users { uuid }
          }
        }
      `
    });

    return {
      data,

      async editGroup(group) {
        this.$router.push(`/groups/${group.uuid}`);
      },

    };
  }
}
</script>
