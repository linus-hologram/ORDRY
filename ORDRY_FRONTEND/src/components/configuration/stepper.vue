<template>
  <!-- This component is used to display progress in a process -->
  <div class="stepper">
    <!-- We need one finished step less than what the active step is at the moment -->
    <!-- The uuid is used as fake unique id because a vue for-loop needs a unique key -->
    <div class="step" v-for="n in (active - 1)" :key="n.uuid">
      <div class="circle">
        <font-awesome-icon class="finished" icon="check" />
      </div>
      <span class="line"></span>
    </div>
    <!-- This is the currently active step -->
    <div class="step">
      <div class="circle active">
        <font-awesome-icon class="finished" icon="check" />
      </div>
      <span class="line"></span>
    </div>
    <!-- We need as much unfinished steps as the whole count of steps minus the currently active step -->
    <div class="step" v-for="n in (count-active)" :key="n.uuid">
      <div class="circle">
        <font-awesome-icon class="unfinished" icon="check" />
      </div>
      <span class="line"></span>
    </div>
  </div>
</template>
<script>
export default {
  name: "stepper",
  // The stepper needs the total count of steps and a currently active step
  props: ["count", "active"]
};
</script>
<style scoped>
.stepper {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.step {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
/* The last step should not have a line */
.step:last-child .line {
  display: none;
}
.circle {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border: solid 6px #14dcb4;
  width: 30px;
  height: 30px;
}
.finished {
  color: #14dcb4;
}
.unfinished {
  color: #000000;
}
.active {
  background-color: #14dcb4;
}
.line {
  width: 100px;
  border-bottom: solid 8px #14dcb4;
}
</style>
