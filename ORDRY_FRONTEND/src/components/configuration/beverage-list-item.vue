<template>
  <div class="beverage">
    <p class="name">{{name}}</p>
    <div class="sizes">
      <!-- We need to change the availability of the beverage-size when the user clicks on it -->
      <div
        class="size"
        v-for="item in sizes"
        :key="item._id"
        v-bind:class="{ available: item.available }"
        @click="changeAvailability(bid, item._id)"
      >
        <p class="size-name">{{item.name}}</p>
        <!-- A checkmark is displayed if the size is available -->
        <font-awesome-icon v-if="item.available" icon="check" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "beverage-list-item",
  //We need the beverageID, its name and its sizes with their IDs, names and availability
  props: ["bid", "name", "sizes"],
  data() {
    return {};
  },
  methods: {
    async changeAvailability(bid, sid) {
      //This method is used to change the availability of the beverage size
      //The styling of the size is changig according to its availability

      var currentSize = this.sizes.find(s => {
        return s._id === sid;
      });

      try {
        await this.$store.dispatch("beverages/updateSizeAvailability", {
          bid: bid,
          sid: sid,
          available: !currentSize.available
        });

        //We need to inform the parent component (beverage-selection.vue) in order to update the number of selected beverages
        this.$emit("availabilityChanged");
      } catch (error) {
        console.error(error);
      }
    }
  }
};
</script>

<style scoped>
.beverage {
  border-bottom: solid 1px #000000;
  display: flex;
  flex-direction: row;
  float: left;
  width: 48%;
  margin: 0 1%;
}
.name {
  flex-basis: 70%;
}
.sizes {
  display: flex;
  flex-direction: column;
  flex-basis: 25%;
}

.size {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.size:hover {
  cursor: pointer;
}
.available {
  color: #14dcb4;
}

@media screen and (max-width: 600px) {
  .beverage {
    width: 98%;
  }
}
</style>
