<template>
  <div class="control">
    <button
      @click="activeFilter = 0, $emit('filterChanged', activeFilter)"
      :class="{'active': activeFilter == 0, 'inactive': activeFilter != 0 }"
    >Konfiguration</button>
    <!-- a filter change gets passed on to the task-list and defines the css styling -->
    <button
      @click="activeFilter = 1, $emit('filterChanged', activeFilter)"
      :class="{'active': activeFilter == 1, 'inactive': activeFilter != 1 }"
    >Abschluss</button>
  </div>
</template>
<script>
export default {
  name: "segmentedControl-Checklist",
  data() {
    return {
      activeFilter: 0
    };
  }
};
</script>
<style scoped>
.control {
  box-sizing: border-box;
  font-size: 18px;
  display: flex;
  width: 95%;
  min-height: 2em;
  margin: 1.5em auto 0.5em;
  justify-content: center;
  background-color: #14dcb4;
  border-radius: 20px;
  border: 1px solid #14dcb4;
}
.control button {
  flex-basis: 50%;
  border-radius: 20px;
  border: none;
  font-size: 18px;
}
.control button:hover {
  cursor: pointer;
}
.inactive {
  background-color: #14dcb4;
  color: #ffffff;
}
.active {
  background-color: #ffffff;
  color: #14dcb4;
  transition: 1s;
}
</style>
