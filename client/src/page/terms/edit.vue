<template>
  <h2>Term - Edit</h2>
  <small v-if="data">{{ data.term.displayName }}</small>
  <form @submit.prevent="handleSubmit()" v-if="data">

    <div class="form-group">
      <label>Display name</label>
      <input type="text" v-model="data.term.displayName" />
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
      <button type="submit">Update</button>
    </div>
  </form>
</template>

<script>

import { getCurrentInstance } from 'vue';
import { useQuery, useMutation } from 'villus';
import { dateRef } from '../../component/date-ref';

export default {
  setup() {
    const instance = getCurrentInstance();
    const route    = instance.proxy.$root.$route;
    const router   = instance.proxy.$root.$router;

    const { data } = useQuery({
      variables: route.params,
      query: `
        query FetchQuery($uuid: ID!) {
          term(uuid: $uuid) {
            uuid
            displayName
            startTime
            endTime
            registerBefore
          }
        }
      `
    });

    const UpdateTerm = `
      mutation UpdateTerm($uuid: ID!, $displayName: String, $startTime: Int, $endTime: Int, $registerBefore: Int) {
        updateTerm(uuid: $uuid, displayName: $displayName, startTime: $startTime, endTime: $endTime, registerBefore: $registerBefore) {
          uuid
        }
      }
    `;

    const { execute: updateTerm } = useMutation(UpdateTerm);

    return {
      data,

      startTime     : dateRef(instance.ctx, 'data.term.startTime'),
      endTime       : dateRef(instance.ctx, 'data.term.endTime'),
      registerBefore: dateRef(instance.ctx, 'data.term.registerBefore'),

      async handleSubmit() {
        const updateResponse = await updateTerm(this.data.term);

        if (updateResponse.error) {
          // TODO: nicer error reporting
          alert(updateResponse.error.message);
          return;
        }

        // Assume it was updated
        this.$router.push('/terms');
      },


    }
  }
};
</script>
