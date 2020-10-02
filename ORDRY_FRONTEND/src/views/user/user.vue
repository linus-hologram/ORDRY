<template>
  <div class="wrapper">
    <!-- If the user clicks on the header we toggle the shopping cart -->
    <div class="header" @click="toggleCart()">
      <font-awesome-icon icon="shopping-cart" />
      <h1>BESTELLUNG</h1>
      <!-- This displays how many products of each categroy have been added to the cart by the user -->
      <div class="amounts">
        <cart-amount :amount="beveragesAmount" icon="glass-whiskey"></cart-amount>
        <cart-amount :amount="dishesAmount" icon="utensils"></cart-amount>
      </div>
    </div>
    <!-- Inside this container we display the child pages -->
    <transition
      tag="span"
      mode="out-in"
      leave-active-class="animated slideOutDown faster"
      enter-active-class="animated slideInUp faster"
    >
      <router-view class="canvas"></router-view>
    </transition>
  </div>
</template>
<script>
import cartAmount from "../../components/user/cart-amount.vue";

import { mapGetters } from "vuex";

export default {
  name: "user",
  components: { cartAmount },
  beforeRouteLeave(to, from, next) {
    if (to.fullPath != "/bestellung-abgeschlossen") {
      const answer = window.confirm(
        "Möchten Sie die Seite wirklich verlassen? Ihre aktuelle Bestellung geht verloren."
      );
      if (answer) {
        this.$store.dispatch("cart/clearCart");
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  },
  methods: {
    alertBeforeLeaving() {
      console.log("leaving");
    },
    toggleCart() {
      //We check if the shopping cart view is not already displayed
      if (this.$router.currentRoute.path != "/benutzer/bestellung") {
        //In this case we open the shopping cart
        this.$router.push("bestellung");
      } else {
        //Otherwise we close the open shopping cart
        this.$router.back();
      }
    }
  },
  computed: {
    ...mapGetters("cart", ["shoppingCartData"]),
    beveragesAmount() {
      let bvgCount = 0;

      this.shoppingCartData.forEach(item => {
        if (item.type === "beverage") bvgCount += item.amount;
      });

      return bvgCount;
    },
    dishesAmount() {
      let dishCount = 0;

      this.shoppingCartData.forEach(item => {
        if (item.type === "food" || item.type === "menu")
          dishCount += item.amount;
      });

      return dishCount;
    }
  }
};
</script>
<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.canvas {
  background-color: #ffffff;
  flex-grow: 1;
  border-radius: 20px 20px 0 0;
}
.header {
  display: flex;
  align-items: center;
  min-height: 4.5em;
  width: 90%;
  margin: 0 auto;
  cursor: pointer;
}
.header h1 {
  margin: 0;
  font-size: 18px;
}
.header .fa-shopping-cart {
  color: #ffffff;
  font-size: 2em;
  margin-right: 2%;
}
.header .amounts {
  margin-left: auto;
  display: flex;
  justify-content: flex-end;
  width: 50%;
}
.cart-amount:first-child {
  margin-right: 4%;
}
</style>