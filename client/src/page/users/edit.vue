<template>
  <h2>User - Edit</h2>
  <small v-if="data">{{ data.user.email }}</small>
  <form @submit.prevent="handleSubmit()" v-if="data">

    <div class="form-group">
      <label>Email</label>
      <input type="text" v-model="data.user.email" disabled />
    </div>

    <div class="form-group">
      <label>Available courses</label>
      <table>
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!data.user.coursesAvailable.length">
            <td><i>No courses available</i></td>
          </tr>
          <tr v-for="course in data.user.coursesAvailable">
            <td>{{ course.term.displayName }} - {{ course.nameCommon }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="form-group">
      <label>Registered courses</label>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>
              <a href="#!" @click.prevent="showModal('registerCourse')"><icon>plus</icon></a>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!data.user.coursesRegistered.length">
            <td><i>No courses registered</i></td>
          </tr>
          <tr v-for="course in data.user.coursesRegistered">
            <td>{{ course.term.displayName }} - {{ course.nameCommon }}</td>
            <td><a href="#!" @click.prevent="unregisterCourseHandler(course)"><icon>trash</icon></a></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="form-group">
      <label>&nbsp;</label>
      <button type="submit">Update</button>
    </div>
  </form>

  <modal v-if="shownModal == 'registerCourse'" :showCloseButton="true" @close="closeModal()">
    <template v-slot:header><h3>Register course</h3></template>
    <template v-slot:body>
      <form @submit.prevent="registerCourseHandler()">

        <div class="form-group">
          <label>Course</label>
          <vue-select
            v-model="registerCourse"
            :options="data && data.user.coursesAvailable || []"
            :label-by="option => option.term.displayName + ' - ' + option.nameCommon"
            :close-on-select="true"
            placeholder="Select course"
            :searchable="true"
            :clear-on-select="true"
          />
        </div>

        <div class="form-group">
          <label>&nbsp;</label>
          <button type="submit">Register</button>
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
          user(uuid: $uuid) {
            uuid
            email
            coursesAvailable {
              uuid
              nameCommon
              term {
                displayName
              }
            }
            coursesRegistered {
              uuid
              nameCommon
              term {
                displayName
              }
            }
          }
        }
      `
    });

    const RegisterCourse = `
      mutation RegisterCourse($user: ID!, $course: ID!) {
        userRegisterCourse(user: $user, course: $course)
      }
    `;

    const UnregisterCourse = `
      mutation UnregisterCourse($user: ID!, $course: ID!) {
        userUnregisterCourse(user: $user, course: $course)
      }
    `;

    // const UpdateUser = `
    //   mutation UpdateUser($uuid: ID!, $displayName: String, $startTime: Int, $endTime: Int, $registerBefore: Int) {
    //     updateTerm(uuid: $uuid, displayName: $displayName, startTime: $startTime, endTime: $endTime, registerBefore: $registerBefore) {
    //       uuid
    //     }
    //   }
    // `;

    // const { execute: updateUser } = useMutation(UpdateUser);
    const { execute: registerCourse   } = useMutation(RegisterCourse);
    const { execute: unregisterCourse } = useMutation(UnregisterCourse);

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

      registerCourse: false,
      async registerCourseHandler() {
        const updateResponse = await registerCourse({
          user   : this.data.user.uuid,
          course : this.registerCourse.uuid,
        });

        if (updateResponse.error) {
          alert(updateResponse.error.message.replace(/^\[GraphQL\] /, ''));
          return;
        }

        await refreshData();
        this.closeModal();
      },

      async unregisterCourseHandler(course) {
        if (!confirm(`Unregister user "${this.data.user.email}" from course "${course.term.displayName} - ${course.nameCommon}"?`)) return;
        const updateResponse = await unregisterCourse({
          user   : this.data.user.uuid,
          course : course.uuid,
        });

        if (updateResponse.error) {
          alert(updateResponse.error.message.replace(/^\[GraphQL\] /, ''));
          return;
        }

        await refreshData();
        this.$forceUpdate();
      },

      async handleSubmit() {
        // const updateResponse = await updateTerm(this.data.term);

        // if (updateResponse.error) {
        //   // TODO: nicer error reporting
        //   alert(updateResponse.error.message);
        //   return;
        // }

        // // Assume it was updated
        this.$router.push('/users');
      },


    }
  }
};
</script>
