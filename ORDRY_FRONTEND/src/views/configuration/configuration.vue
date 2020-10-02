<template>
  <div id="configuration">
    <div class="container">
      <h1>KONFIGURATION</h1>
      <!-- The stepper displays the progress in the configuration process, it has 5 steps -->
      <stepper :count="5" :active="active"></stepper>
    </div>
    <transition name="slide" mode="out-in">
      <!-- This router-view renders the sub-pages -->
      <!-- We need to listen for the activated event in order to change the stepper accordingly -->
      <router-view @activated="changeStepper" class="view"></router-view>
    </transition>
  </div>
</template>

<script>
import stepper from "../../components/configuration/stepper.vue";

export default {
  name: "configuration",
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
#configuration {
  display: flex;
  flex-flow: column;
  height: 100%;
}
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  flex: 0 1 auto;
  margin: 0 10px 0.5em;
}
</style>
