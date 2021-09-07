<template>
  <h2>Terms - Create</h2>
  <form @submit.prevent="handleSubmit()">
    <div class="form-group">
      <label>Display name</label>
      <input type="text" v-model="displayName" />
    </div>
    <div class="form-group">
      <label>Start</label>
      <input type="date" v-model="startTime" />
    </div>
    <div class="form-group">
      <label>End</label>
      <input type="date" v-model="endTime" />
    </div>
    <div class="form-group">
      <label>Register before</label>
      <input type="date" v-model="registerBefore" />
    </div>
    <div class="form-group">
      <label>&nbsp;</label>
      <button type="submi">Create</button>
    </div>
    <br/><br/>
  </form>
</template>

<script>

import { useMutation } from 'villus';
import { parseISO } from 'date-fns';

export default {
  setup() {
    const CreateTerm = `
      mutation CreateTerm($displayName: String!, $startTime: Int!, $endTime: Int!, $registerBefore: Int!) {
        createTerm(displayName: $displayName, startTime: $startTime, endTime: $endTime, registerBefore: $registerBefore) {
          uuid
        }
      }
    `;

    const { data, execute } = useMutation(CreateTerm);
    return {
      async handleSubmit() {
        const variables = {
          displayName    : this.displayName,
          startTime      : parseISO(this.startTime).valueOf() / 1000,
          endTime        : parseISO(this.endTime).valueOf() / 1000,
          registerBefore : parseISO(this.registerBefore).valueOf() / 1000,
        };
        const result = await execute(variables);

        if (result.error) {
          // TODO: nicer error reporting
          alert(result.error.message);
          return;
        }

        // Assume it was created
        this.$router.push('/terms');
      }
    };
  }
}
</script>
