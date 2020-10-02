<template>
  <div class="productList">
    <transition name="fade">
      <segmentedControl @filterChanged="onFilterChange"></segmentedControl>
    </transition>
    <!-- we are listening for a filter change here so the appropriate form (beverage/food) can be displayed-->
    <template v-if="filter == 'beverages'">
      <!-- for is used to display all beverages of an array -->
      <!-- we are also listening for the edit+delete events to pass them on to the parent with the needed information (the ID) -->
      <product-list-item
        v-for="item in sortedBeverages"
        :name="item.name"
        :details="item.category"
        :key="item._id"
        @edit="editModus(item._id)"
        @delete="deleteItem(item._id)"
      ></product-list-item>
    </template>
    <template v-else-if="filter == 'food'">
      <!-- for is used to display all food of an array -->
      <!-- we are also listening for the edit+delete events to pass them on to the parent with the needed information (the ID) -->
      <product-list-item
        v-for="item in sortedFood"
        :name="item.name"
        :details="item.price"
        :key="item._id"
        @edit="editModus(item._id)"
        @delete="deleteItem(item._id)"
      ></product-list-item>
    </template>
    <template v-else>
      <!-- This only gets displayed when the something is wrong with the filter. The message is therefore technically misleading -->
      <p>Keine Produkte vorhanden!</p>
    </template>
  </div>
</template>
<script>
import productListItem from "../administration/product-list-item.vue";
import segmentedControl from "../../components/segmented-control.vue";

import { mapGetters } from "vuex";

export default {
  name: "productList",
  components: {
    productListItem,
    segmentedControl
  },
  data() {
    return {
      filter: "beverages"
    };
  },
  methods: {
    //Method for the filter change event. It tells the list which products to display with the filter variable
    //and passes this information on to the parent component in order to later inform the input form component.
    onFilterChange(data) {
      this.filter = data;
      this.$emit("filterChanged", data);
    },
    //This is also needed to pass information on to the parent component for adjusting the input form
    editModus(pid) {
      this.$emit("edit", pid);
    },
    //The delete action can be handled here directly 'cos all information has been collected
    //and it is not necessary to inform the parent component about the action
    //(maybe rethink this if the form should be resetted afterwards?)
    deleteItem(pid) {
      if (
        confirm("Möchten Sie dieses Produkt wirklich unwiederruflich löschen?")
      ) {
        if (this.filter == "beverages") {
          //Delete the beverage here
          this.$store.dispatch("beverages/deleteBeverageWithId", pid);
        } else if (this.filter == "food") {
          //Delete the food here
          this.$store.dispatch("food/deleteFoodWithId", pid);
        }
      }
    }
  },
  created() {
    this.$store.dispatch("food/fetchAllFood");
    this.$store.dispatch("beverages/fetchAllBeverages");
  },
  computed: {
    ...mapGetters("food", ["sortedFood"]),
    ...mapGetters("beverages", ["sortedBeverages"])
  }
};
</script>
<style scoped>
h1 {
  color: white;
}
.productList {
  background-color: #ffffff;
  border-radius: 15px 15px 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.control {
  width: 95%;
  margin: 1.5em 0 0.5em 0;
}
</style>
