<template>
  <h2>Course - Edit</h2>
  <small v-if="data">{{ data.course.nameCommon }}</small>
  <form @submit.prevent="handleSubmit()" v-if="data">

    <div class="form-group">
      <label>Term</label>

      <vue-select
        v-model="data.course.term"
        :options="data && data.terms || []"
        label-by="displayName"
        :close-on-select="true"
        :placeholder="data.course.term.displayName || 'Select term'"
        :searchable="true"
        :clear-on-select="true"
      />

    </div>

    <div class="form-group">
      <label>Teacher</label>
      <vue-select
        v-model="data.course.teacher"
        :options="data && data.teachers || []"
        :label-by="option => option.nameShort + ' - ' + option.email"
        :close-on-select="true"
        :placeholder="data.course.teacher && (data.course.teacher.nameShort + ' - ' + data.course.teacher.email) || 'Select teacher'"
        :searchable="true"
        :clear-on-select="true"
      />
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
      <label>Max registered users</label>
      <input type="number" step="1" v-model="data.course.registeredUsersMax" />
    </div>
    <div class="form-group">
      <label>Lesson count</label>
      <input type="number" step="1" v-model="data.course.lessonCount" />
    </div>
    <div class="form-group">
      <label>Type</label>
      <vue-select
        v-model="data.course.type"
        :options="availableTypes"
        label-by="text"
        value-by="value"
        :close-on-select="true"
        placeholder="Select type"
        :searchable="true"
        :clear-on-select="true"
      />
    </div>
    <div class="form-group">
      <label>Location</label>
      <input type="text" v-model="data.course.location" />
    </div>
    <div class="form-group">
      <label>Exceptions</label>
      <table style="width:500px;">
        <thead>
          <tr>
            <th>Occurrence</th>
            <th>Action</th>
            <th><a href="#!" @click.prevent="createException()"><icon>plus</icon></a></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="exception in data.course.exception">
            <td><input type="number" step="1" v-model="exception.occurrence" @change="updateException(exception)" /></td>
            <td>
              <select v-model="exception.action" @change="updateException(exception)">
                <option value="drop">Uitval</option>
              </select>
            </td>
            <td><a href="#!" @click.prevent="deleteException(exception)"><icon>trash</icon></a></td>
          </tr>
        </tbody>
      </table>
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
            <td>{{ new Date(schedule.startTime * 1000).toISOString().split('T').shift() }}</td>
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

  <modal v-if="shownModal == 'editSchedule'" :showCloseButton="true" @close="closeModal()">
    <template v-slot:header><h3>Edit schedule</h3></template>
    <template v-slot:body>
      <form @submit.prevent="closeModal()">
        <div class="form-group">
          <label>Start</label>
          <input type="date" v-model="modSchedule.startTime" @change="updateCourseSchedule(modSchedule)" />
        </div>
        <br />
        <br />
        <table>
          <thead>
            <tr>
              <th>Weekday</th>
              <th>Period</th>
              <th><a href="#!" @click.prevent="addScheduleRecord(modSchedule)"><icon>plus</icon></a></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in modSchedule.record">
              <td>
                  <!-- v-model="data.course.term" -->
                <vue-select
                  @update:modelValue="updateCourseScheduleRecord(record)"
                  v-model="record.dayOfWeek"
                  :options="availableWeekdays"
                  label-by="text"
                  value-by="value"
                  :close-on-select="true"
                  placeholder="Select Weekday"
                  :searchable="true"
                  :clear-on-select="true"
                />
              </td>
              <td><input type="number" step="1" v-model="record.period" @change="updateCourseScheduleRecord(record)" /></td>
              <td><a style="margin-left:0.5em;" href="#!" @click.prevent="deleteScheduleRecord(modSchedule, record)"><icon>trash</icon></a></td>
            </tr>
          </tbody>
        </table>
        <div class="form-group">
          <label>&nbsp;</label>
          <button type="submit">Close</button>
        </div>
      </form>
    </template>
  </modal>

</template>

<script>

import modal from '../../component/modal.vue';

import 'vue-next-select/dist/index.min.css';
import VueSelect from 'vue-next-select';

import 'vue3-date-time-picker/dist/main.css'
import DatePicker from 'vue3-date-time-picker';

import { getCurrentInstance } from 'vue';;
import { useQuery, useMutation } from 'villus';
import { parseISO } from 'date-fns';
import icon from '../../component/icon.vue';
import { debounce } from 'debounce';

export default {
  components: {icon,VueSelect,DatePicker,modal},

  setup() {
    const instance = getCurrentInstance();
    const route    = instance.proxy.$root.$route;

    const { data, execute: refreshData } = useQuery({
      variables: route.params,
      query: `
        query FetchQuery($uuid: ID!) {
          course(uuid: $uuid) {
            uuid
            nameCommon
            nameShort
            description
            registeredUsersMax
            lessonCount
            type
            location
            exception {
              uuid
              occurrence
              action
            }
            term {
              uuid
              displayName
            }
            teacher {
              uuid
              nameShort
              email
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
            email
          }
          terms {
            uuid
            displayName
          }
        }
      `
    });

    const UpdateCourse = `
      mutation UpdateCourse($uuid: ID!, $nameCommon: String!, $nameShort: String!, $description: String, $registeredUsersMax: Int!, $lessonCount: Int!, $type: String!, $location: String!, $teacher: ID!, $term: ID!) {
        updateCourse(uuid: $uuid, nameCommon: $nameCommon, nameShort: $nameShort, description: $description, registeredUsersMax: $registeredUsersMax, lessonCount: $lessonCount, type: $type, location: $location, teacher: $teacher, term: $term) {
          uuid
        }
      }
    `;

    const CreateException = `
      mutation CreateException($course: ID!, $action: String!, $occurrence: Int!) {
        createCourseException(course: $course, action: $action, occurrence: $occurrence) {
          uuid
        }
      }
    `;

    const UpdateException = `
      mutation UpdateException($uuid: ID!, $action: String!, $occurrence: Int!) {
        updateCourseException(uuid: $uuid, action: $action, occurrence: $occurrence) {
          uuid
        }
      }
    `;

    const DeleteException = `
      mutation DeleteException($uuid: ID!) {
        deleteCourseException(uuid: $uuid)
      }
    `;

    const CreateSchedule = `
      mutation CreateSchedule($course: ID!, $startTime: Int!) {
        createCourseSchedule(course: $course, startTime: $startTime) {
          uuid
          startTime
          record {
            uuid
            period
            dayOfWeek
          }
        }
      }
    `;

    const UpdateSchedule = `
      mutation UpdateSchedule($uuid: ID!, $startTime: Int!) {
        updateCourseSchedule(uuid: $uuid, startTime: $startTime) {
          startTime
        }
      }
    `;

    const DeleteSchedule = `
      mutation DeleteSchedule($uuid: ID!) {
        deleteCourseSchedule(uuid: $uuid)
      }
    `;

    const CreateScheduleRecord = `
      mutation CreateScheduleRecord($courseSchedule: ID!, $dayOfWeek: Int!, $period: Int!) {
        createCourseScheduleRecord(courseSchedule: $courseSchedule, period: $period, dayOfWeek: $dayOfWeek) {
          uuid
          dayOfWeek
          period
        }
      }
    `;

    const UpdateScheduleRecord = `
      mutation UpdateScheduleRecord($uuid: ID!, $dayOfWeek: Int!, $period: Int!) {
        updateCourseScheduleRecord(uuid: $uuid, period: $period, dayOfWeek: $dayOfWeek) {
          uuid
          dayOfWeek
          period
        }
      }
    `;

    const DeleteScheduleRecord = `
      mutation DeleteScheduleRecord($uuid: ID!) {
        deleteCourseScheduleRecord(uuid: $uuid)
      }
    `;

    // Map queries into functions
    const { execute: updateCourse         } = useMutation(UpdateCourse);
    const { execute: createException      } = useMutation(CreateException);
    const { execute: updateException      } = useMutation(UpdateException);
    const { execute: deleteException      } = useMutation(DeleteException);
    const { execute: createSchedule       } = useMutation(CreateSchedule);
    const { execute: updateSchedule       } = useMutation(UpdateSchedule);
    const { execute: deleteSchedule       } = useMutation(DeleteSchedule);
    const { execute: createScheduleRecord } = useMutation(CreateScheduleRecord);
    const { execute: updateScheduleRecord } = useMutation(UpdateScheduleRecord);
    const { execute: deleteScheduleRecord } = useMutation(DeleteScheduleRecord);

    return {
      availableTypes: [
        { value:"avo"    , text: "AVO" },
        { value:"talent" , text: "Talent" },
        { value:"support", text: "Ondersteunend" },
      ],
      availableWeekdays: [
        { value: 0, text: "Monday"    },
        { value: 1, text: "Tuesday"   },
        { value: 2, text: "Wednesday" },
        { value: 3, text: "Thursday"  },
        { value: 4, text: "Friday"    },
        { value: 5, text: "Saturday"  },
        { value: 6, text: "Sunday"    },
      ],
      modSchedule: {},
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

      async createSchedule() {

        // Create the schedule
        const scheduleResponse = await createSchedule({
          course    : route.params.uuid,
          startTime : Math.floor(Date.now() / 1000),
        });

        // Add to the overview
        const schedule = scheduleResponse.data.createCourseSchedule;
        this.data.course.schedule.push(schedule);

        // Open edit modal
        this.editSchedule(schedule);
      },

      async createException() {
        const response = await createException({
          course     : route.params.uuid,
          action     : 'drop',
          occurrence : 0,
        });

        if (response.error) alert(response.error.message.replace(/^\[GraphQL\] /, ''));
        await refreshData();
      },

      updateException: debounce(async function(exception) {
        const response = await updateException(exception);
        if (response.error) alert(response.error.message.replace(/^\[GraphQL\] /, ''));
        await refreshData();
      }, 500),

      async deleteException(exception) {
        const response = await deleteException({ uuid : exception.uuid });
        if (response.error) alert(response.error.message.replace(/^\[GraphQL\] /, ''));
        await refreshData();
      },

      async editSchedule(schedule) {
        schedule = Object.assign({},schedule);
        if ('number' == typeof schedule.startTime) {
          schedule.startTime = new Date(schedule.startTime * 1000).toISOString().substr(0,10);
        }

        this.modSchedule = schedule;
        await this.$forceUpdate();
        this.showModal('editSchedule');
      },

      async deleteSchedule(schedule) {
        const deleteResponse = await deleteSchedule({ uuid : schedule.uuid });
        const result         = deleteResponse.data.deleteCourseSchedule;
        if (!result) return;
        const idx = this.data.course.schedule.indexOf(schedule);
        this.data.course.schedule.splice(idx, 1);
      },

      async addScheduleRecord(schedule) {
        const createResponse = await createScheduleRecord({
          courseSchedule : schedule.uuid,
          period         : 0,
          dayOfWeek      : 0,
        });

        schedule.record.push(createResponse.data.createCourseScheduleRecord);
      },

      updateCourseSchedule: debounce(async function(schedule) {
        const startTime      = Math.floor(new Date(schedule.startTime).getTime() / 1000);
        const updateResponse = await updateSchedule({
          uuid : schedule.uuid,
          startTime,
        });
        this.data.course.schedule.find(s => s.uuid == schedule.uuid).startTime = startTime
        this.modSchedule.startTime = new Date(updateResponse.data.updateCourseSchedule.startTime * 1000).toISOString().substr(0,10);

        // this.$forceUpdate();
      }, 500),

      updateCourseScheduleRecord: debounce(async record => {
        const updateResponse = await updateScheduleRecord(record);
        Object.assign(record, updateResponse.data.updateCourseScheduleRecord);
      }, 500),

      async deleteScheduleRecord(schedule, record) {
        const deleteResponse = await deleteScheduleRecord({ uuid : record.uuid });
        const result         = deleteResponse.data.deleteCourseScheduleRecord;
        if (!result) return;
        const idx = schedule.record.indexOf(record);
        schedule.record.splice(idx, 1);
      },

      async handleSubmit() {
        const variables = {
          ...this.data.course,
          teacher : this.data.course.teacher.uuid,
          term    : this.data.course.term.uuid,
        };
        const result = await updateCourse(variables);

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
