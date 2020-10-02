<template>
  <!-- If the user clicks on a beverage order it is set to finished and we need to inform the parent about the change because we need the last finished oid in case the user wants to undo his last action -->
  <div class="order-beverages" @click="setToFinished" v-swipe="setToFinished">
    <p class="guest">{{guestname}}</p>
    <p class="bvg" v-for="item in beverages" :key="item.id">{{item.amount}} x {{item.name}}</p>
  </div>
</template>

<script>
export default {
  name: "order-beverages",
  //We need the orderID, the name of the guest and its beverages with their sizeIDs, names and amount
  props: ["oid", "guestname", "beverages"],
  data() {
    return {};
  },
  methods: {
    generateUUID() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(
        c
      ) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
    setToFinished() {
      //Here you need to change the status of the beverages from this order to finished
      //Afterwards this order will disappear automatically from the list because it does not belong to 'orders with open beverages' anymore
      this.$store.dispatch("orders/markOrderBeveragesFinished", this.oid);
    }
  },
  created() {
    this.beverages.map(b => {
      b.id = this.generateUUID();
    });
  }
};
</script>

<style scoped>
.order-beverages {
  background-color: #ffffff;
  width: 100%;
  box-sizing: border-box;
  border-radius: 20px;
  padding: 0 0 1em 5%;
  margin-bottom: 1em;
}
.order-beverages:hover {
  cursor: pointer;
  background-color: #e0e0e0;
}
.guest {
  color: #14dcb4;
  font-family: "Raleway";
  font-weight: 500;
  font-size: 20px;
}
.bvg {
  margin: 0 0 0 10%;
}
</style>
