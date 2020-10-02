<template>
  <!-- This popup is used to display orders which were selected for settlement -->
  <transition appear name="slide">
    <div class="bill">
      <font-awesome-icon class="close-icon" icon="times" @click="$emit('close')" />
      <div class="details">
        <span class="order" v-for="item in orders" :key="item.id" @click="$emit('remove', item)">
          <span>{{item.forename + " " + item.surname}}</span>
          <span class="currency">{{getTotal(item) | toCurrency }}</span>
        </span>
        <span class="total currency">{{total | toCurrency}}</span>
      </div>
      <icon-button customColor="#DC143C" icon="receipt" @click.native="pay"></icon-button>
    </div>
  </transition>
</template>
<script>
import iconButton from "../../components/icon-button.vue";

export default {
  name: "billing",
  components: { iconButton },
  props: ["orders"],
  methods: {
    pay() {
      this.orders.forEach(order => {
        this.$store.dispatch("orders/markOrderFinished", order.id);
        console.log("Pay order: " + order.id);
      });
      this.$emit("payed");
    },
    getTotal(order) {
      var total = 0;
      order.items.forEach(item => {
        total += item.price * item.amount;
      });
      return total;
    }
  },
  computed: {
    total: function() {
      var total = 0;
      this.orders.forEach(order => {
        total += this.getTotal(order);
      });
      return total;
    }
  }
};
</script>
<style scoped>
.bill {
  display: flex;
  justify-content: space-between;
  background-color: #333333;
  width: 70%;
  min-height: 4em;
  z-index: 9999;
  position: fixed;
  bottom: 0;
  padding: 1em 10px 10px;
  box-sizing: border-box;
  border-radius: 15px 15px 0px 0px;
}
.bill .close-icon {
  color: #e4e4e4;
  font-size: 1.5em;
  margin: 0.3em;
  font-weight: 100;
  cursor: pointer;
}
.bill button {
  font-size: 35px;
  height: 2em;
  width: 2em;
  margin: auto 2% auto 0;
}
.details {
  display: flex;
  flex-direction: column;
  color: #fff;
  width: 75%;
  font-size: 16px;
}
.order {
  width: 100%;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
}
.order span {
  margin: 0.5em 0;
}
.total {
  border-top: 1px solid #fff;
  text-align: right;
  padding: 0.5em 0;
  font-weight: 500;
  font-size: 1.25em;
}
.currency {
  font-family: "Raleway";
}
.slide-leave-active,
.slide-enter-active {
  transition: 0.5s;
}
.slide-enter {
  transform: translate(0, 100%);
}
.slide-leave-to {
  transform: translate(0, 100%);
}
</style>
