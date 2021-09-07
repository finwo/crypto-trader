<template>
  <h2>Courses - Create</h2>
  <form @submit.prevent="handleSubmit()" v-if="data">
    <div class="form-group">
      <label>Term</label>
      <select v-model="term">
        <option v-for="term in data.terms" v-bind:value="term.uuid">{{ term.displayName }}</option>
      </select>
    </div>
    <div class="form-group">
      <label>Teacher</label>
      <select v-model="teacher">
        <option v-for="teacher in data.teachers" v-bind:value="teacher.uuid">{{ teacher.nameShort }}</option>
      </select>
    </div>
    <div class="form-group">
      <label>Common name</label>
      <input type="text" v-model="nameCommon" />
    </div>
    <div class="form-group">
      <label>Short name</label>
      <input type="text" v-model="nameShort" />
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea v-model="description"></textarea>
    </div>
    <div class="form-group">
      <label>Lesson count</label>
      <input type="number" step="1" v-model="lessonCount" />
    </div>
    <div class="form-group">
      <label>Type</label>
      <select v-model="type">
        <option value="avo">AVO</option>
        <option value="talent">Talent</option>
        <option value="support">Ondersteunend</option>
      </select>
    </div>
    <div class="form-group">
      <label>Location</label>
      <input type="text" v-model="location" />
    </div>
    <div class="form-group">
      <label>&nbsp;</label>
      <button type="submit">Create</button>
    </div>
    <br/><br/>
  </form>
</template>

<script>

import { useQuery, useMutation } from 'villus';
import { parseISO } from 'date-fns';

export default {
  setup() {

    const { data } = useQuery({
      query: `
        query {
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

    const CreateCourse = `
      mutation CreateCourse($nameCommon: String!, $nameShort: String!, $description: String, $lessonCount: Int!, $type: String!, $location: String!, $teacher: ID!, $term: ID!) {
        createCourse(nameCommon: $nameCommon, nameShort: $nameShort, description: $description, lessonCount: $lessonCount, type: $type, location: $location, teacher: $teacher, term: $term) {
          uuid
        }
      }
    `;

    const { execute } = useMutation(CreateCourse);
    return {
      data,
      async handleSubmit() {
        const variables = {
          nameCommon  : this.nameCommon,
          nameShort   : this.nameShort,
          description : this.description,
          lessonCount : this.lessonCount,
          type        : this.type,
          location    : this.location,
          teacher     : this.teacher,
          term        : this.term,
        };
        const result = await execute(variables);

        if (result.error) {
          // TODO: nicer error reporting
          alert(result.error.message);
          return;
        }

        // Assume it was created
        this.$router.push(`/courses/${result.data.createCourse.uuid}`);
      }
    };
  }
}
</script>
