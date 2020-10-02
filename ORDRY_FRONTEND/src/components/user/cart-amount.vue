<template>
  <!-- This components is used to display the amount of drinks/dishes the user has selected -->
  <div class="cart-amount">
    <p class="amount">{{amount}}</p>
    <font-awesome-icon :icon="icon" />
  </div>
</template>
<script>
import $ from "jquery";

export default {
  name: "cart-amount",
  //We need the amount and an icon for the category
  props: ["amount", "icon"],
  watch: {
    amount: function() {
      $(".cart-amount").addClass("animated pulse");
      setTimeout(() => {
        $(".cart-amount").removeClass("animated pulse");
      }, 1000);
    }
  }
};
</script>
<style scoped>
.cart-amount {
  background-color: #dc143c;
  border-radius: 40px;
  font-size: 22px;
  height: 1.6em;
  display: flex;
  color: #ffffff;
  align-items: center;
  justify-content: space-evenly;
  width: 38%;
}
.cart .amount {
  font-family: "Raleway";
}
</style>