<template>
  <div class="wrapper">
    <h2>Auswahl Getränke</h2>
    <div class="beverages">
      <!-- after every change of availability we need to check how many beverages are currently selected -->
      <beverageItem
        v-for="item in sortedBeverages"
        :key="item._id"
        :bid="item._id"
        :name="item.name"
        :sizes="item.sizes"
        @availabilityChanged="updateNumberOfSelections()"
      ></beverageItem>
    </div>
    <div class="navigation">
      <!-- this button replaces the current route with the last step in the configuration -->
      <button
        id="back-btn"
        class="btn-round"
        @click="$router.replace('check-liste'), $emit('activated', 1)"
      >Zurück</button>
      <div class="next">
        <p class="info">Ausgewählt: {{selected}}</p>
        <!-- this button replaces the current route with the next step in the configuration -->
        <!-- the activated event tells the parent component (configuration.vue) which step of the stepper needs to be active -->
        <!-- it is not possible to continue with the configuration if the no beverages are selected -->
        <button
          id="next-btn"
          class="btn-round"
          @click="$router.replace('speisen'), $emit('activated', 3)"
          :disabled="selected<=0"
        >Weiter</button>
      </div>
    </div>
  </div>
</template>
<script>
import beverageItem from "../../components/configuration/beverage-list-item.vue";

import { mapGetters } from "vuex";

export default {
  name: "beverage-selection",
  components: { beverageItem },
  data() {
    return {
      //Number of beverages that are selected
      selected: 0
    };
  },
  computed: {
    ...mapGetters("beverages", ["sortedBeverages"])
  },
  methods: {
    updateNumberOfSelections() {
      //This method validates how much beverages are currently selected
      //You probably need to modify this since we are not really using the test data array
      var selections = 0;
      this.sortedBeverages.forEach(bvg => {
        bvg.sizes.forEach(size => {
          if (size.available) {
            selections++;
          }
        });
      });
      this.selected = selections;
    }
  },
  created() {
    //When the component is created we need to define the number of selected items
    this.$store.dispatch("beverages/fetchAllBeverages").then(() => {
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
.beverages {
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