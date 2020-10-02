<template>
  <!-- We need to change the availability of the food when the user clicks on it -->
  <div class="food-item" @click="changeAvailability(fid)">
    <p class="name">{{name}}</p>
    <!-- A checkmark is displayed if the size is available -->
    <font-awesome-icon class="check" v-if="available" icon="check" />
  </div>
</template>

<script>
export default {
  name: "food-list-item",
  //We need the foodID, its name and availability
  props: ["fid", "name", "available"],
  data() {
    return {};
  },
  methods: {
    async changeAvailability(fid) {
      //This method is used to change the availability of the food
      //The styling of the food is changig according to its availability

      try {
        await this.$store.dispatch("food/updateFoodAvailability", {
          id: fid,
          available: !this.available
        });

        //We need to inform the parent component (beverage-selection.vue) in order to update the number of selected food
        this.$emit("availabilityChanged");
      } catch (error) {
        console.error(error);
      }
    }
  }
};
</script>

<style scoped>
.food-item {
  border-bottom: solid 1px #000000;
  display: flex;
  flex-direction: row;
  align-items: center;
  float: left;
  width: 48%;
  margin: 0 1%;
}
.food-item:hover {
  cursor: pointer;
}
.name {
  width: 90%;
}
.check {
  color: #14dcb4;
  width: 10%;
}

@media screen and (max-width: 600px) {
  .food {
    width: 98%;
  }
}
</style>
