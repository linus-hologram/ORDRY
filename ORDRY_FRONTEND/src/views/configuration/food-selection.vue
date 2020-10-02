<template>
  <div class="wrapper">
    <h2>Auswahl Speisen</h2>
    <div class="food">
      <!-- We need to change the availability of the food when the user clicks on it -->
      <foodItem
        v-for="item in sortedFood"
        :key="item._id"
        :fid="item._id"
        :name="item.name"
        :available="item.available"
        @availabilityChanged="updateNumberOfSelections()"
      ></foodItem>
    </div>
    <div class="navigation">
      <!-- this button replaces the current route with the last step in the configuration -->
      <button
        id="back-btn"
        class="btn-round"
        @click="$router.replace('getränke'), $emit('activated', 2)"
      >Zurück</button>
      <div class="next">
        <p class="info">Ausgewählt: {{selected}}</p>
        <!-- this button replaces the current route with the next step in the configuration -->
        <!-- the activated event tells the parent component (configuration.vue) which step of the stepper needs to be active -->
        <!-- it is not possible to continue with the configuration if the food is selected -->
        <button
          id="next-btn"
          class="btn-round"
          @click="$router.replace('menüs'), $emit('activated', 4)"
          :disabled="selected<=0"
        >Weiter</button>
      </div>
    </div>
  </div>
</template>
<script>
import foodItem from "../../components/configuration/food-list-item.vue";

import { mapGetters } from "vuex";

export default {
  name: "food-selection",
  components: { foodItem },
  data() {
    return {
      //Number of selected food items
      selected: 0
    };
  },
  computed: {
    ...mapGetters("food", ["sortedFood"])
  },
  methods: {
    updateNumberOfSelections() {
      //This method validates how much food is currently selected
      //You probably need to modify this since we are not really using the test data array
      var selections = 0;
      this.sortedFood.forEach(food => {
        if (food.available) {
          selections++;
        }
      });
      this.selected = selections;
    }
  },
  created() {
    //When the component is created we need to define the number of selected items
    this.$store.dispatch("food/fetchAllFood").then(() => {
      this.updateNumberOfSelections();
    });
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
  align-items: center;
  justify-content: space-between;
  overflow-y: auto;
}
.food {
  width: 80%;
  overflow-y: auto;
  height: 70%;
}
.navigation {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 1em;
}
.next {
  align-self: flex-end;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap-reverse;
  justify-content: flex-end;
  align-items: center;
  width: 50%;
}
#next-btn,
#back-btn {
  width: 150px;
  height: 40px;
  margin: 0 10px;
}
</style>