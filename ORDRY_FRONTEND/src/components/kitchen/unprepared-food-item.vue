<template>
  <!-- If the user clicks on an unprepared food numerator we inform the parent about the change -->
  <div class="unprepared-food" @click="lowerAmount()" :class="{zero: amount<=0}">
    <div class="content">
      <icon-button
        id="remove"
        icon="minus"
        customColor="#DC143C"
        :disabled="amount<=0"
        @click.native="lowerAmount()"
      ></icon-button>
      <!-- We add special styling for menu items with a dynamic class -->
      <transition
        tag="span"
        leave-active-class="animated fadeOut faster"
        enter-active-class="animated fadeIn faster"
        mode="out-in"
      >
        <p class="amount" :class="{menu: menu==true}" :key="amount">{{amount}}</p>
      </transition>
      <p class="item">{{item}}</p>
    </div>
  </div>
</template>

<script>
import iconButton from "../icon-button.vue";

export default {
  name: "unprepared-food-item",
  //We need the amount, a name for the item and the fact if it is a menu or not
  props: ["amount", "item", "menu"],
  components: { iconButton },
  methods: {
    lowerAmount() {
      //We only inform the parent if the amount is not already zero because it cannot go lower than that
      if (this.amount > 0) {
        this.$emit("prepared");
      }
    }
  }
};
</script>

<style scoped>
.unprepared-food {
  position: relative;
  display: inline-block;
  width: 12vw;
  height: 12vw;
  border-radius: 20px;
  background-color: #ffffff;
  margin-right: 2vw;
  margin-bottom: 2vw;
}
.content {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.content button {
  width: 25px;
  height: 25px;
  margin: 10px;
  align-self: flex-end;
}
.amount {
  margin: 10px auto 0;
  font-family: "Roboto";
  font-weight: 700;
  font-size: 8vw;
  color: #bdbdbd;
  position: absolute;
  left: 0%;
  right: 0%;
  top: 0%;
  bottom: 24.67%;
  text-align: center;
}
.menu {
  color: rgba(20, 220, 180, 0.5);
}
.item {
  text-align: center;
  font-size: 1.4vw;
  padding: 0 5px;
  box-sizing: border-box;
  width: 100%;
  position: absolute;
  bottom: 0;
  right: 0;
}
.zero {
  background-color: rgba(255, 255, 255, 0.5);
}
.zero .menu {
  color: #bdbdbd;
}
/*This prevents hover styling on mobile devices. */
@media (hover: hover) {
  .food:hover {
    cursor: pointer;
    background-color: #e0e0e0;
  }
  .zero:hover {
    cursor: not-allowed;
    background-color: rgba(255, 255, 255, 0.5);
  }
}
</style>
