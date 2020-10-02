<template>
  <div class="menu-wrapper">
    <div class="menu">
      <!-- We display the menu name and the names of the menu items -->
      <p class="name">{{menu.name}}</p>
      <p class="price">{{price|toCurrency}}</p>
      <div class="details">{{itemText}}</div>
    </div>
    <!-- This button triggers the item selection popup -->
    <icon-button
      id="more"
      icon="arrow-right"
      customColor="#B82442"
      @click.native="showDetails = true"
    ></icon-button>
    <!-- We darken the background if the popup is active -->
    <div class="overlay" v-show="showDetails"></div>
    <options-modal v-show="showDetails" @close="showDetails=false">
      <div class="header">
        <h2>{{menu.name}}</h2>
        <!-- The price is adjusted based on the selected items -->
        <p class="price">{{price|toCurrency}}</p>
      </div>
      <div class="menu-selection">
        <!-- We listen for a change of the checked status in order to validate the selection -->
        <span v-for="item in menu.food" :key="item._id">
          <checkbox checked="true" @checked="validateMenu()" :value="item._id"></checkbox>
          <p>{{item.name}}</p>
        </span>
      </div>
      <!-- If there is less than one item selected this button is disabled.
      Otherwise it calls the addMenu method which informs the parent about the change.-->
      <button
        class="btn-round"
        @click="addMenu(menu._id), showDetails=false"
        :disabled="!menuSelected"
      >
        <font-awesome-icon class="icon" icon="plus" id="plus" />Hinzufügen
      </button>
    </options-modal>
  </div>
</template>
<script>
import $ from "jquery"; // needed to work with jquery in order to validate the checkboxes

import iconButton from "../../components/icon-button.vue";
import optionsModal from "../../components/user/options-modal.vue";
import checkbox from "../checkbox.vue";

export default {
  name: "menu-item",
  //We need a menu object
  props: ["menu"],
  components: { iconButton, optionsModal, checkbox },
  data() {
    return {
      //This defines if the popup is visible or not
      showDetails: false,
      //This is true if at least one menu item is selected
      menuSelected: true,
      //This is the calculated price according to the menu selection
      calcPrice: null
    };
  },
  computed: {
    itemText: function() {
      //A string is created out of the menu item names
      var text = "";

      var itemNames = [];
      this.menu.food.forEach(item => {
        itemNames.push(item.name);
      });
      text = itemNames.join(" • ");

      return text;
    },
    price: function() {
      //This is the total price show on the overview list - not the price used on the
      var p = 0;
      if (this.calcPrice == null) {
        this.menu.food.forEach(item => {
          p += item.price;
        });
      } else {
        return this.calcPrice;
      }
      return p;
    }
  },
  methods: {
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
      //We inform the parent about the change
      this.$emit("added", menu);
    },
    validateMenu() {
      // This method validates if at least one menu-item is selected
      var selected = false;
      var food = [];
      $(".checkbox").each(function() {
        if (this.checked) {
          selected = true;
          food.push($(this).attr("value"));
        }
      });
      this.calculate(food);
      this.menuSelected = selected;
    },
    calculate(selectedItems) {
      //We calculate the current menu price based on the item selection
      var price = 0;
      selectedItems.forEach(id => {
        var food = this.menu.food.find(item => {
          return item._id == id;
        });
        price += food.price;
      });
      this.calcPrice = price;
    }
  }
};
</script>
<style scoped>
.menu-wrapper {
  display: flex;
  align-items: center;
  width: 90%;
  min-height: 6em;
  padding: 0 5%;
  border-bottom: solid 2px #000000;
}
.menu {
  display: flex;
  flex-wrap: wrap;
  flex-basis: 90%;
}
.menu p {
  margin: 0;
}
.menu-wrapper > button {
  margin-left: auto;
  font-size: 20px;
  height: 2em;
  width: 2em;
}
.menu .name {
  flex-basis: 55.5%;
}
.price {
  font-family: "Raleway";
  color: #828282;
}
.menu-wrapper .details {
  font-size: 16px;
  font-style: italic;
  color: #828282;
  margin: 1em 0;
  flex-basis: 100%;
}
.overlay {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
}
.menu-selection {
  display: flex;
  flex-direction: column;
  margin: 0 0 2em 5%;
}
.menu-selection span {
  display: flex;
  align-items: center;
}
.menu-selection .checkbox-container {
  margin-right: 10px;
}
.header {
  display: flex;
  align-items: center;
  margin-bottom: 1em;
}
.header .price {
  margin: 0 0 0 auto;
}
.header h2 {
  margin: 0;
}
.btn-round {
  width: 80%;
  margin: 0 10%;
}
.btn-round .icon {
  margin-right: 10px;
}
</style>