<template>
  <div>
    <h2>Courses</h2>
    <table v-if="data">
      <thead>
        <tr>
          <th>Name</th>
          <th>Teacher</th>
          <th>Term</th>
          <th>Students</th>
          <th><router-link to="/courses/create"><icon>plus</icon></router-link></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="course in data.courses">
          <td>{{ course.nameCommon }}</td>
          <td>{{ course.teacher.nameShort }}</td>
          <td>{{ course.term.displayName }}</td>
          <td>{{ course.registeredUsersCount }}</td>
          <td>
            <a href="#!" @click.prevent="editCourse(course)"><icon>edit</icon></a>
            <a href="#!" @click.prevent="deleteCourse(course)"><icon>trash</icon></a>
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
          courses {
            uuid
            nameCommon
            registeredUsersCount
            teacher {
              nameShort
            }
            term {
              displayName
            }
          }
        }
      `
    });

    const DeleteCourse = `
      mutation DeleteCourse($uuid: ID!) {
        deleteCourse(uuid: $uuid)
      }
    `;

    const { execute } = useMutation(DeleteCourse);

    return {
      data,

      async editCourse(course) {
        this.$router.push(`/courses/${course.uuid}`);
      },

      async deleteCourse(course) {
        if (!confirm(`Delete course '${course.nameCommon}'?`)) return;
        const result = await execute(course);
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
