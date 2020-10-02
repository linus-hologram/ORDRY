<template>
  <!-- This is a popup for creating/editing menus -->
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            <h2>Produkt hinzufügen</h2>
            <!-- This button tells the parent component to hide the popup again -->
            <button class="btn-round" id="close" @click="$emit('close')">
              <font-awesome-icon icon="arrow-left" id="arrow" />Zurück
            </button>
          </div>
          <p class="guest">{{forename + ' ' + surname}}</p>
          <!-- We are reusing the segmented control here. We have to listen for a change of the filter to display the right products -->
          <segmented-control @filterChanged="changeFilter"></segmented-control>

          <div class="modal-body" v-if="filter=='beverages'">
            <!-- This is displayed if the user selected the beverage filter 
            We are listening for the 'added beverage' event to inform the parent about the change
            so that we are able to manipulate the data accordingly-->
            <beverage
              v-for="item in availableBeverages"
              :key="item._id"
              :bid="item._id"
              :name="item.name"
              :sizes="item.sizes"
              @added-bvg="addBVG"
            ></beverage>
          </div>
          <div class="food-body" v-if="filter=='food'">
            <div class="menu">
              <h4>{{availableMenu.name}}</h4>
              <!-- The different menu items are displayed with checkboxes 
              When the user checks/unchecks one of them we need to validate if at least one item is still selected-->
              <span v-for="item in availableMenu.food" :key="item._id">
                <checkbox checked="true" @checked="validateMenu()" :value="item._id"></checkbox>
                <p>{{item.name}}</p>
              </span>
              <!-- If there is less than one item selected this button is disabled.
              Otherwise it calls the addMenu method which informs the parent about the change.-->
              <button
                class="btn-round"
                @click="addMenu(availableMenu._id)"
                :disabled="!menuSelected"
              >
                <font-awesome-icon icon="plus" id="plus" />Hinzufügen
              </button>
            </div>
            <div class="foods">
              <!-- This is displayed if the user selected the food filter 
              We are listening for the 'added food' event to inform the parent about the change
              so that we are able to manipulate the data accordingly-->
              <food
                v-for="item in availableFood"
                :key="item._id"
                :fid="item._id"
                :name="item.name"
                @added-food="addFood"
              ></food>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import $ from "jquery"; // needed to work with jquery in order to validate the checkboxes

import segmentedControl from "../segmented-control.vue";
import beverage from "../point-of-sale/beverage-add.vue";
import food from "../point-of-sale/food-add.vue";
import checkbox from "../checkbox.vue";

import { mapGetters } from "vuex";

export default {
  name: "add-product-modal",
  //We need the guests fore- and surename to display at the top of the popup
  props: ["forename", "surname"],
  components: { segmentedControl, beverage, food, checkbox },
  data() {
    return {
      //This filter is changed through the segmented control
      filter: "beverages",
      //This is true if at least one menu item is selected
      menuSelected: true
    };
  },
  methods: {
    changeFilter(newFilter) {
      this.filter = newFilter;
    },
    addBVG(ids) {
      //We close this popup and inform the parent about the change
      this.$emit("close");
      this.$emit("added-bvg", ids);
    },
    addFood(fid) {
      //We close this popup and inform the parent about the change
      this.$emit("close");
      this.$emit("added-food", fid);
    },
    addMenu(mid) {
      //We are building an array with the menu-items out of the values from the checked checkboxes
      var food = [];
      $(".checkbox").each(function() {
        if (this.checked) {
          food.push($(this).attr("value"));
        }
      });
      //Then we create a menu object with the menuID and the selected items. This object is then forwarded to the parent
      var menu = {
        id: mid,
        items: food
      };
      //We close this popup and inform the parent about the change
      this.$emit("close");
      this.$emit("added-menu", menu);
    },
    validateMenu() {
      // This method validates if at least one menu-item is selected
      var selected = false;
      $(".checkbox").each(function() {
        if (this.checked) {
          selected = true;
        }
      });
      this.menuSelected = selected;
    }
  },
  computed: {
    ...mapGetters("beverages", ["availableBeverages"]),
    ...mapGetters("food", ["availableFood"]),
    ...mapGetters("menu", ["availableMenu"])
  },
  async created() {
    try {
      await this.$store.dispatch("beverages/fetchAllBeverages");
      console.log("fetched beverages!", this.availableBeverages);

      await this.$store.dispatch("food/fetchAllFood");
      console.log("fetched food!", this.availableFood);

      await this.$store.dispatch("menu/fetchAllMenus");
      console.log("fetched menus!", this.availableMenu);
    } catch (error) {
      console.log(error);
    }
  }
};
</script>
<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
  font-size: 20px;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 60%;
  height: 22em;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  padding-top: 0.5em;
}
.modal-header h2 {
  margin: 0;
}
.modal-header button {
  margin-left: auto;
}
.modal-body,
.foods {
  flex-grow: 1;
  padding: 1em 2%;
  overflow-y: auto;
  overflow-x: hidden;
}
.body {
  display: flex;
  flex-direction: row;
}
p {
  margin: 0.5em 0;
}

#close {
  background-color: #828282;
}
#arrow,
#plus {
  margin-right: 10px;
}

.guest {
  font-family: "Raleway";
  font-size: 24px;
  font-weight: 500;
  color: #14dcb4;
  margin-bottom: 1em;
}

.menu {
  display: flex;
  flex-direction: column;
  width: 30%;
}
.menu span {
  display: flex;
  align-items: center;
}
.menu .checkbox-container {
  margin-right: 10px;
}
.menu button {
  width: 80%;
  margin: 1em auto 0;
  font-size: 16px;
}
.menu h4 {
  margin-bottom: 0.5em;
}
.foods {
  width: 65%;
}
.food-body {
  display: flex;
  height: 65%;
}
/*Transition*/
.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
