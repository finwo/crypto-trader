<template>
  <h2>Courses - Edit</h2>
  <small v-if="data">{{ data.course.nameCommon }}</small>
  <form @submit.prevent="handleSubmit()" v-if="data">
    <div class="form-group">
      <label>Term</label>
      <select v-model="data.course.term.uuid">
        <option v-for="term in data.terms" v-bind:value="term.uuid">{{ term.displayName }}</option>
      </select>
    </div>
    <div class="form-group">
      <label>Teacher</label>
      <select v-model="data.course.teacher.uuid">
        <option v-for="teacher in data.teachers" v-bind:value="teacher.uuid">{{ teacher.nameShort }}</option>
      </select>
    </div>
    <div class="form-group">
      <label>Common name</label>
      <input type="text" v-model="data.course.nameCommon" />
    </div>
    <div class="form-group">
      <label>Short name</label>
      <input type="text" v-model="data.course.nameShort" />
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea v-model="data.course.description"></textarea>
    </div>
    <div class="form-group">
      <label>Lesson count</label>
      <input type="number" step="1" v-model="data.course.lessonCount" />
    </div>
    <div class="form-group">
      <label>Type</label>
      <select v-model="data.course.type">
        <option value="avo">AVO</option>
        <option value="talent">Talent</option>
        <option value="support">Ondersteunend</option>
      </select>
    </div>
    <div class="form-group">
      <label>Location</label>
      <input type="text" v-model="data.course.location" />
    </div>
    <div class="form-group">
      <label>Schedule</label>
      <table style="width:500px;">
        <thead>
          <tr>
            <th>Start</th>
            <th><a href="#!" @click.prevent="createSchedule()"><icon>plus</icon></a></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="schedule in data.course.schedule">
            <td>{{ new Date(schedule.startTime * 1000).toLocaleString('nl-NL') }}</td>
            <td>
              <a href="#!" @click.prevent="editSchedule(schedule)"><icon>edit</icon></a>
              <a href="#!" @click.prevent="deleteSchedule(schedule)"><icon>trash</icon></a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="form-group">
      <label>&nbsp;</label>
      <button type="submit">Update</button>
    </div>
    <br/><br/>
  </form>

  <dialog ref="createCourseDialog">
    I'm a creation dialog
  </dialog>

  <dialog ref="editCourseDialog">
    I'm an edit dialog
  </dialog>

</template>

<style scoped>
td > a + a {
  margin-left: 0.5em;
}
</style>

<script>

import { getCurrentInstance } from 'vue';;
import { useQuery, useMutation } from 'villus';
import { parseISO } from 'date-fns';
import icon from '../../component/icon.vue';
import dialogPolyfill from 'dialog-polyfill';

export default {
  components: {icon},

  setup() {
    const instance = getCurrentInstance();
    const route    = instance.proxy.$root.$route;
    const dialogs  = {};

    const { data } = useQuery({
      variables: route.params,
      query: `
        query FetchQuery($uuid: ID!) {
          course(uuid: $uuid) {
            uuid
            nameCommon
            nameShort
            description
            lessonCount
            type
            location
            term {
              uuid
            }
            teacher {
              uuid
            }
            schedule {
              uuid
              startTime
              record {
                uuid
                period
                dayOfWeek
              }
            }
          }
          teachers {
            uuid
            nameShort
          }
          terms {
            uuid
            displayName
          }
        }
      `
    });

    const UpdateCourse = `
      mutation UpdateCourse($uuid: ID!, $nameCommon: String!, $nameShort: String!, $description: String, $lessonCount: Int!, $type: String!, $location: String!, $teacher: ID!, $term: ID!) {
        updateCourse(uuid: $uuid, nameCommon: $nameCommon, nameShort: $nameShort, description: $description, lessonCount: $lessonCount, type: $type, location: $location, teacher: $teacher, term: $term) {
          uuid
        }
      }
    `;

    const { execute: executeUpdate } = useMutation(UpdateCourse);
    return {
      data,
      getDialog(name) {
        if (!dialogs[name]) {
          dialogs[name] = this.$refs[name];
          dialogPolyfill.registerDialog(dialogs[name]);
        }
        return dialogs[name];
      },
      async createSchedule() {
        const dialog = this.getDialog('createCourseDialog');
        dialog.showModal();
        // console.log({ self: this, course });
      },
      async editSchedule(schedule) {
        const dialog = this.getDialog('editCourseDialog');
        dialog.showModal();
        // console.log({ self: this, schedule });
      },
      async handleSubmit() {
        const variables = {
          uuid        : this.data.course.uuid,
          nameCommon  : this.data.course.nameCommon,
          nameShort   : this.data.course.nameShort,
          description : this.data.course.description,
          lessonCount : this.data.course.lessonCount,
          type        : this.data.course.type,
          location    : this.data.course.location,
          teacher     : this.data.course.teacher.uuid,
          term        : this.data.course.term.uuid,
        };
        const result = await executeUpdate(variables);

        if (result.error) {
          // TODO: nicer error reporting
          alert(result.error.message);
          return;
        }

        // Assume it was updated
        this.$router.push('/courses');
      }
    };
  }
}
</script>
