<template>
  <div id="closing">
    <div class="header">
      <h1>ABSCHLUSS</h1>
      <!-- The stepper displays the progress in the configuration process, it has 5 steps -->
      <stepper :count="4" :active="active"></stepper>
    </div>
    <router-view @activated="changeStepper"></router-view>
  </div>
</template>

<script>
import stepper from "../../components/configuration/stepper.vue";

export default {
  name: "closing",
  components: { stepper },
  beforeRouteLeave(to, from, next) {
    if (to.fullPath != "/kassa") {
      this.$store.dispatch("user/clearCredentials");
      next();
    } else {
      next();
    }
  },
  data() {
    return {
      active: 1
    };
  },
  methods: {
    changeStepper(value) {
      // This method changes the active step according to the information from the event
      // This gets triggered every time the user finishes a step or decides to go back in the process
      this.active = value;
    }
  }
};
</script>

<style scoped>
#closing {
  display: flex;
  flex-flow: column;
  height: 100%;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  flex: 0 1 auto;
  margin: 0 10px 0.5em;
}
</style>
