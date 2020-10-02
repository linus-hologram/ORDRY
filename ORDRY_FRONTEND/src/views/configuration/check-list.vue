<template>
  <div class="wrapper">
    <h2>Hüttendienst Check-Liste</h2>
    <div class="check-list">
      <!-- everytime a checkbox is checked a method validates if there are any unchecked checkboxes left -->
      <checkListItem
        @check="allDone()"
        v-for="item in firstSectionItems"
        :key="item._id"
        :info="item.title"
        :img="item.imageId"
      ></checkListItem>
    </div>
    <div class="next">
      <!-- This gets displayed if the checklist is not completed -->
      <p class="info" v-show="!done">Schließen Sie die Check-Liste ab!</p>
      <!-- the button replaces the current route with the next step in the configuration -->
      <!-- the activated event tells the parent component (configuration.vue) which step of the stepper needs to be active -->
      <button
        id="next-btn"
        class="btn-round"
        @click="$router.replace('getränke'), $emit('activated', 2)"
        :disabled="!done"
      >Weiter</button>
    </div>
  </div>
</template>
<script>
import checkListItem from "../../components/configuration/check-list-item.vue";
import $ from "jquery"; // needed to work with jquery in order to validate the checkboxes

import { mapGetters } from "vuex";

export default {
  name: "config-check-list",
  components: { checkListItem },
  data() {
    return {
      done: false
    };
  },
  computed: {
    ...mapGetters("checklist", ["firstSectionItems"]) // make use of the vuex store getter for the firstSectionItems
  },
  methods: {
    allDone() {
      // This method checks if there are any unchecked checkboxes left
      // The result is then saved in the 'done' variable, which is used to disable the next button and display some information for the user
      var finished = true;
      $(".checkbox").each(function() {
        if (!this.checked) {
          finished = false;
        }
      });
      this.done = finished;
    }
  },
  created() {
    this.$store.dispatch("checklist/fetchAllChecklistItems"); // start fetching all checklist items once the instance has been created.
  }
};
</script>
<style scoped>
h2 {
  margin-left: 2%;
  align-self: flex-start;
}
.wrapper {
  background-color: #ffffff;
  border-radius: 15px 15px 0 0;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  overflow-y: auto;
  align-items: center;
  justify-content: space-between;
}
.next {
  align-self: flex-end;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap-reverse;
  justify-content: flex-end;
  align-items: center;
  width: 50%;
  margin-bottom: 1em;
}
.check-list {
  width: 80%;
  overflow-y: auto;
  height: 70%;
}
#next-btn {
  width: 150px;
  height: 40px;
  margin: 0 10px;
}
</style>