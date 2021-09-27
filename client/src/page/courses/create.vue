<template>
  <h2>Courses - Create</h2>
  <form @submit.prevent="handleSubmit()">
    <div class="form-group">
      <label>Term</label>

      <vue-select
        v-model="term"
        :options="data && data.terms || []"
        label-by="displayName"
        :close-on-select="true"
        :placeholder="data && 'Select term' || 'Loading...'"
        :searchable="true"
        :clear-on-select="true"
      />

    </div>
    <div class="form-group">
      <label>Teacher</label>

      <vue-select
        v-model="teacher"
        :options="data && data.teachers || []"
        :label-by="option => option.nameShort + ' - ' + option.email"
        :close-on-select="true"
        :placeholder="data && 'Select teacher' || 'Loading...'"
        :searchable="true"
        :clear-on-select="true"
      />

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
      <label>Max registered users</label>
      <input type="number" step="1" v-model="registeredUsersMax" />
    </div>
    <div class="form-group">
      <label>Lesson count</label>
      <input type="number" step="1" v-model="lessonCount" />
    </div>
    <div class="form-group">
      <label>Type</label>
      <vue-select
        v-model="type"
        :options="availableTypes"
        label-by="text"
        :close-on-select="true"
        placeholder="Select type"
        :searchable="true"
        :clear-on-select="true"
      />
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

<style>
  .vue-select {
    background: var(--col-pri-bg);
    border-radius: 0;
    border: 1px solid var(--col-pri-fg);
    color: inherit;
  }
  .vue-dropdown-item {
    padding: 0.5em;
  }
  .vue-dropdown-item.highlighted {
    background : #28E;
    color      : #FFF;
  }
  .vue-dropdown-item.selected {
    background : #DDD;
    color      : var(--col-pri-fg);
  }
  .vue-dropdown-item.selected.highlighted {
    background : #FF6A6A;
    color      : #FFF;
  }
  .vue-input {
    padding: unset;
  }
  .vue-input input {
    opacity: unset;
    font-size: inherit;
    padding-left: 0.5em;
    padding-right: 0.5em;
  }
  input::placeholder {
    color : var(--col-pri-fg);
    opacity: unset;
  }
</style>

<script>

import 'vue-next-select/dist/index.min.css';
import VueSelect from 'vue-next-select';
import { useQuery, useMutation } from 'villus';
import { parseISO } from 'date-fns';

export default {
  components: { VueSelect },

  setup() {

    const { data } = useQuery({
      query: `
        query {
          teachers {
            uuid
            email
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
      mutation CreateCourse($nameCommon: String!, $nameShort: String!, $description: String, $registeredUsersMax: Int!, $lessonCount: Int!, $type: String!, $location: String!, $teacher: ID!, $term: ID!) {
        createCourse(nameCommon: $nameCommon, nameShort: $nameShort, description: $description, registeredUsersMax: $registeredUsersMax, lessonCount: $lessonCount, type: $type, location: $location, teacher: $teacher, term: $term) {
          uuid
        }
      }
    `;

    const { execute } = useMutation(CreateCourse);
    return {
      availableTypes: [
        { value:"avo"    , text: "AVO" },
        { value:"talent" , text: "Talent" },
        { value:"support", text: "Ondersteunend" },
      ],
      data,
      async handleSubmit() {
        const variables = {
          nameCommon         : this.nameCommon,
          nameShort          : this.nameShort,
          description        : this.description,
          registeredUsersMax : this.registeredUsersMax,
          lessonCount        : this.lessonCount,
          type               : this.type.value,
          location           : this.location,
          teacher            : this.teacher.uuid,
          term               : this.term.uuid,
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
