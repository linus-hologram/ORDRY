<template>
  <div class="statistics">
    <!-- We display all session reports in a list -->
    <report v-for="item in sessions" :key="item._id" :session="item"></report>
  </div>
</template>

<script>
import report from "../../components/administration/report.vue";

import SessionService from "../../services/SessionService";

export default {
  name: "statistics",
  components: { report },
  data() {
    return {
      //This is the test data I used
      sessions: []
    };
  },
  async created() {
    try {
      const response = await SessionService.getAllSessions();
      this.sessions = response.data.result;
    } catch (error) {
      console.error("Could not fetch the sessions: ", error);
    }
  }
};
</script>

<style scoped>
.statistics {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin: 1em 10px 0;
  padding: 1em 0 0;
  box-sizing: border-box;
  background-color: #ffffff;
  border-radius: 15px 15px 0 0;
}
</style>