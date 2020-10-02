<template>
  <div class="cart">
    <h2>Meine Bestellung</h2>
    <!-- This should display the name, which the user entered in the login form -->
    <p class="guest">{{forename + " " + surname}}</p>
    <!-- The product list has the same structure as the list in the POS section -->
    <transition-group
      tag="div"
      class="product-list"
      leave-active-class="animated fadeOut faster"
      enter-active-class="animated fadeIn faster"
    >
      <div class="product" v-for="item in shoppingCartData" :key="itemKey(item)">
        <icon-button
          id="remove"
          icon="minus"
          customColor="#000000"
          @click.native="removeProduct(item)"
        ></icon-button>
        <p>{{getName(item)}}</p>
        <p class="price">{{item.amount * item.price | toCurrency}}</p>
      </div>
      <div class="total-price" :key="0">
        <p>Gesamtsumme:</p>
        <p>{{total | toCurrency}}</p>
      </div>
    </transition-group>
    <!-- The user can complete his order or cancle the process -->
    <button
      class="btn-round"
      @click="createOrder()"
      v-show="shoppingCartData.length > 0"
    >Jetzt bestellen</button>
    <button class="btn-round" @click="cancelOrder()">Bestellung abbrechen</button>
  </div>
</template>
<script>
import iconButton from "../../components/icon-button.vue";

import { mapGetters, mapState } from "vuex";

export default {
  name: "shopping-cart",
  components: { iconButton },
  methods: {
    getName(item) {
      //This method puts the displayed description together
      //Same as in the POS section
      var name;
      name = item.amount + " x " + item.name;
      if (item.items != null) {
        name += // I have to map here because the items array contains objects - necessary for grouping shit together
          " (" +
          item.items
            .map(i => {
              return i.name;
            })
            .join(", ") +
          ")";
      }
      return name;
    },
    createOrder() {
      //Here you need to create the order for the guest with his added products
      this.$store.dispatch("cart/sendOrderToOrdryApi");
      console.log("Order successfully created.");
      this.$router.replace("../bestellung-abgeschlossen");
    },
    cancelOrder() {
      this.$store.dispatch("cart/clearCart");
      this.$router.replace("../login/user");
    },
    removeProduct(product) {
      //Here you need to reduce the amount/remove the product from the shopping cart
      //similar to the POS section
      this.$store.dispatch("cart/removeProductFromCart", product);
      console.log(JSON.stringify(product) + " removed.");
    },
    itemKey(item) {
      return item.type == "menu" ? item.uuids : item.id;
    }
  },
  computed: {
    //The total price is calculated with the amount and price of the ordered items
    total: function() {
      var total = 0;
      this.shoppingCartData.forEach(item => {
        total += item.price * item.amount;
      });
      return total;
    },
    ...mapGetters("cart", ["shoppingCartData"]),
    ...mapState("cart", ["forename", "surname"])
  }
};
</script>
<style scoped>
.cart {
  padding: 0 5%;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.cart .guest {
  color: #14dcb4;
  font-family: "Raleway";
  font-weight: 500;
  font-size: 24px;
  margin: 0 0 0.5em 0;
}
.cart h2 {
  margin-bottom: 0.5em;
}
.product-list {
  flex-grow: 1;
  overflow: auto;
}
.product {
  display: flex;
  align-items: center;
  border-bottom: solid 1px #828282;
  min-height: 4em;
}
.product p {
  font-size: 16px;
}
.product:last-child {
  border-bottom: solid 2px #828282;
}
.price {
  margin-left: auto;
  font-family: "Raleway";
  color: #828282;
}
.product #remove {
  height: 25px;
  width: 25px;
  margin-right: 10px;
}
.total-price {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.total-price p:nth-child(2) {
  font-size: 24px;
  font-weight: 500;
}
.cart .btn-round {
  width: 100%;
  margin: 0.5em 0;
  border-radius: 2em;
  min-height: 2.5em;
}
.cart .btn-round:last-child {
  background-color: #828282;
}
</style>