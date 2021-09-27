<template>
  <h2>Group - Edit</h2>
  <small v-if="data">{{ data.group.schoolYear }} - {{ data.group.name }}</small>
  <form @submit.prevent="handleSubmit()" v-if="data">

    <div class="form-group">
      <label>Name</label>
      <input type="text" v-model="data.group.name" disabled />
    </div>

    <div class="form-group">
      <label>Available courses</label>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>
              <a href="#!" @click.prevent="showModal('addCourse')"><icon>plus</icon></a>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!data.group.coursesAvailable.length">
            <td><i>No courses available</i></td>
          </tr>
          <tr v-for="course in data.group.coursesAvailable">
            <td>{{ course.term.displayName }} - {{ course.nameCommon }}</td>
            <td><a href="#!" @click.prevent="removeCourseHandler(course)"><icon>trash</icon></a></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="form-group">
      <label>Users</label>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>
              <a href="#!" @click.prevent="showModal('addUser')"><icon>plus</icon></a>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!data.group.users.length">
            <td><i>No users in this group</i></td>
          </tr>
          <tr v-for="user in data.group.users">
            <td>{{ user.email }}</td>
            <td><a href="#!" @click.prevent="removeUserHandler(user)"><icon>trash</icon></a></td>
          </tr>
        </tbody>
      </table>
    </div>

  </form>

  <modal v-if="shownModal == 'addCourse'" :showCloseButton="true" @close="closeModal()">
    <template v-slot:header><h3>Add course</h3></template>
    <template v-slot:body>
      <form @submit.prevent="addCourseHandler()">

        <div class="form-group">
          <label>Course</label>
          <vue-select
            v-model="selectedCourse"
            placeholder="Select course"
            :searchable="true"
            :close-on-select="true"
            :clear-on-select="true"
            :options="data && data.courses || []"
            :label-by="option => option.term.displayName + ' - ' + option.nameCommon"
          />
        </div>

        <div class="form-group">
          <label>&nbsp;</label>
          <button type="submit">Add</button>
        </div>

      </form>
    </template>
  </modal>

  <modal v-if="shownModal == 'addUser'" :showCloseButton="true" @close="closeModal()">
    <template v-slot:header><h3>Add user</h3></template>
    <template v-slot:body>
      <form @submit.prevent="addUserHandler()">

        <div class="form-group">
          <label>User</label>
          <vue-select
            v-model="selectedUser"
            placeholder="Select user"
            :searchable="true"
            :close-on-select="true"
            :clear-on-select="true"
            :options="data && data.users || []"
            :label-by="option => option.email"
          />
        </div>

        <div class="form-group">
          <label>&nbsp;</label>
          <button type="submit">Add</button>
        </div>

      </form>
    </template>
  </modal>

</template>

<script>

import { getCurrentInstance } from 'vue';
import { useQuery, useMutation } from 'villus';
import { dateRef } from '../../component/date-ref';
import icon from '../../component/icon.vue';
import modal from '../../component/modal.vue';

import 'vue-next-select/dist/index.min.css';
import VueSelect from 'vue-next-select';

export default {
  components: { icon, modal, VueSelect },
  setup() {
    const instance = getCurrentInstance();
    const route    = instance.proxy.$root.$route;
    const router   = instance.proxy.$root.$router;

    const { data, execute : refreshData } = useQuery({
      variables: route.params,
      query: `
        query FetchQuery($uuid: ID!) {
          courses {
            uuid
            nameCommon
            term {
              displayName
            }
          }
          users {
            uuid
            email
          }
          group(uuid: $uuid) {
            uuid
            schoolYear
            name
            coursesAvailable {
              uuid
              nameCommon
              term {
                displayName
              }
            }
            users {
              uuid
              email
            }
          }
        }
      `
    });

    const AddCourse = `
      mutation AddCourse($group: ID!, $course: ID!) {
        userGroupAddCourse(group: $group, course: $course)
      }
    `;

    const RemoveCourse = `
      mutation RemoveCourse($group: ID!, $course: ID!) {
        userGroupRemoveCourse(group: $group, course: $course)
      }
    `;

    const AddUser = `
      mutation AddUser($group: ID!, $user: ID!) {
        userGroupAddUser(group: $group, user: $user)
      }
    `;

    const RemoveUser = `
      mutation RemoveUser($group: ID!, $user: ID!) {
        userGroupRemoveUser(group: $group, user: $user)
      }
    `;

    const { execute: addCourse    } = useMutation(AddCourse);
    const { execute: removeCourse } = useMutation(RemoveCourse);
    const { execute: addUser      } = useMutation(AddUser);
    const { execute: removeUser   } = useMutation(RemoveUser);

    return {
      data,

      shownModal: false,
      showModal(name) {
        this.shownModal = name;
        this.$forceUpdate();
      },
      closeModal() {
        this.shownModal = false;
        this.$forceUpdate();
      },

      selectedCourse: false,
      async addCourseHandler() {
        const response = await addCourse({
          group  : this.data.group.uuid,
          course : this.selectedCourse.uuid,
        });

        if (response.error) {
          alert(response.error.message.replace(/^\[GraphQL\] /, ''));
          return;
        }

        await refreshData();
        this.closeModal();
      },

      async removeCourseHandler(course) {
        if (!confirm(`Remove course "${course.nameCommon}" from group "${this.data.group.name}"?`)) return;
        const response = await removeCourse({
          group  : this.data.group.uuid,
          course : course.uuid,
        });

        if (response.error) {
          alert(response.error.message.replace(/^\[GraphQL\] /, ''));
          return;
        }

        await refreshData();
        this.$forceUpdate();
      },

      selectedUser: false,
      async addUserHandler() {
        const response = await addUser({
          group : this.data.group.uuid,
          user  : this.selectedUser.uuid,
        });

        if (response.error) {
          alert(response.error.message.replace(/^\[GraphQL\] /, ''));
          return;
        }

        await refreshData();
        this.closeModal();
      },

      async removeUserHandler(user) {
        if (!confirm(`Remove user "${user.email}" from group "${this.data.group.name}"?`)) return;
        const response = await removeUser({
          group : this.data.group.uuid,
          user  : user.uuid,
        });

        if (response.error) {
          alert(response.error.message.replace(/^\[GraphQL\] /, ''));
          return;
        }

        await refreshData();
        this.closeModal();
      },

      async handleSubmit() {
        // const updateResponse = await updateTerm(this.data.term);

        // if (updateResponse.error) {
        //   // TODO: nicer error reporting
        //   alert(updateResponse.error.message);
        //   return;
        // }

        // // Assume it was updated
        this.$router.push('/groups');
      },


    }
  }
};
</script>
