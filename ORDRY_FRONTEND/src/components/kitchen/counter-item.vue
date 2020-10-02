<template>
  <!-- If the user clicks on a prepared item from the counter list we inform the parent about the change -->
  <div class="counter-item" v-swipe="finish" @click="finish" id="item" ref="item">
    <p class="guest">{{guestname}}</p>
    <p class="item">{{item}}</p>
    <!-- This tag is displayed if the counter item is a menu item -->
    <small-tag v-if="menu==true" status="M" customColor="#14DCB4"></small-tag>
  </div>
</template>

<script>
import smallTag from "../../components/small-tag.vue";

export default {
  name: "counter-item",
  //We need the name of the guest, a name for the item and the fact if it is a menu or not
  props: ["guestname", "item", "menu"],
  components: { smallTag },
  methods: {
    finish() {
      this.$emit("finished");
    }
  }
};
</script>

<style scoped>
p {
  margin: 0;
  font-size: 14px;
}
.counter-item {
  background-color: #ffffff;
  width: 100%;
  box-sizing: border-box;
  min-height: 3em;
  border-radius: 4em;
  padding: 0.5em 5%;
  margin-bottom: 1em;
  display: flex;
  align-items: center;
  transform: translateX(calc(var(--x, 0) * 1%));
  transition-duration: 1s;
}
.guest {
  color: #14dcb4;
  font-family: "Raleway";
  font-weight: 500;
  text-align: center;
  width: 35%;
  margin-right: 10px;
}
.item {
  width: 50%;
}
.tag {
  width: 2em;
}
/*This prevents hover styling on mobile devices. */
@media (hover: hover) {
  .counter-item:hover {
    cursor: pointer;
    background-color: #e0e0e0;
  }
}
</style>
