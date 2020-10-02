<template>
  <div class="carte">
    <h2>Speisekarte</h2>
    <!-- This filter switches the view between beverages and food-->
    <segmented-control @filterChanged="changeFilter"></segmented-control>
    <!-- The second filter is only displayed if the user selects beverages -->
    <segmented-control-bvg
      v-show="filter == 'beverages'"
      @filterChanged="changeFilterBvg"
    ></segmented-control-bvg>
    <!-- Depending on the filter the beverage-list is displayed -->
    <!-- It uses a computed property in order to handle the beverage category filter -->
    <!-- We listen for the added event in order to add the selected beverage(size) to the shopping cart -->
    <transition-group
      tag="span"
      enter-active-class="animated zoomIn faster"
      class="products"
    >
      <span class="beverages" v-if="filter == 'beverages'" key="beverage">
        <beverage
          v-for="item in beveragesFiltered"
          :key="item._id"
          :beverage="item"
          @added="addToCartBvg"
        ></beverage>
      </span>

      <menu-item
        v-if="filter == 'food' && availableMenu != null"
        :menu="availableMenu"
        @added="addToCartMenu"
        key="menu"
      ></menu-item>
      <span class="food" v-if="filter == 'food'" key="food">
        <food
          v-for="item in availableFood"
          :key="item._id"
          :food="item"
          @added="addToCartFood"
        ></food>
      </span>

      <!-- The daily menu is displayed if the user selected the food filter -->
      <!-- We listen for the added event in order to add the selected menu configuration to the shopping cart -->
      <!-- Depending on the filter the food-list is displayed -->
      <!-- We listen for the added event in order to add the selected food to the shopping cart -->
    </transition-group>
  </div>
</template>
<script>
import segmentedControl from "../../components/segmented-control.vue";
import segmentedControlBvg from "../../components/user/segmented-control-bvg.vue";
import beverage from "../../components/user/beverage.vue";
import food from "../../components/user/food.vue";
import menuItem from "../../components/user/menu.vue";

import { mapGetters } from "vuex";

export default {
  name: "carte",
  components: {
    segmentedControl,
    segmentedControlBvg,
    beverage,
    food,
    menuItem
  },
  data() {
    return {
      //This filter is changed through the segmented control
      filter: "beverages",
      //This filter is changed through the beverage segmented control
      filterBeverage: "cold"
    };
  },
  methods: {
    changeFilter(newFilter) {
      //This method changes the beverages/food filter
      this.filter = newFilter;
    },
    changeFilterBvg(newFilter) {
      //This method changes the warm/cold/alcohol beverages filter
      this.filterBeverage = newFilter;
    },
    addToCartBvg(bvg) {
      //Here you need to add the Beverage size to the order
      //You get a beverage object that just contains the selected size in its size-array
      this.$store.dispatch("cart/addBeverageToCart", bvg);
      console.log("Added beverage to cart:", JSON.stringify(bvg));
    },
    addToCartFood(food) {
      //Here you need to add the food to the order
      //You get a food object
      this.$store.dispatch("cart/addFoodToCart", food);
      console.log("Added food to cart: " + JSON.stringify(food));
    },
    addToCartMenu(menu) {
      //Here you need to add the menu to the order
      //You get a menu object that just contains the selected fooditem-IDs in its items-array
      this.$store.dispatch("cart/addMenuToCart", menu);
      console.log("Added menu to cart: " + JSON.stringify(menu));
    }
  },
  computed: {
    ...mapGetters("beverages", ["availableBeverages"]),
    ...mapGetters("food", ["availableFood"]),
    ...mapGetters("menu", ["availableMenu"]),

    //Here the beverage data is filtered according to the beverage filter
    beveragesFiltered: function() {
      switch (this.filterBeverage) {
        case "cold":
          return this.availableBeverages.filter(bvg => {
            return bvg.category == "kalt";
          });
        case "warm":
          return this.availableBeverages.filter(bvg => {
            return bvg.category == "warm";
          });
        case "alcohol":
          return this.availableBeverages.filter(bvg => {
            return bvg.category == "alkoholisch";
          });
        default:
          return this.beverages;
      }
    }
  },
  async created() {
    try {
      await this.$store.dispatch("beverages/fetchAllBeverages");
      await this.$store.dispatch("food/fetchAllFood");
      await this.$store.dispatch("menu/fetchAllMenus");
    } catch (error) {
      console.error(error);
    }
  }
};
</script>
<style scoped>
.carte {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.carte .products {
  flex-grow: 1;
  /* height: calc(100% - 8em); */
  overflow-y: auto;
}
.carte h2 {
  color: #000000;
  margin-left: 5%;
}
.carte .control {
  margin: 0 auto 1em;
  width: 90%;
}
</style>
