<template>
  <!-- This popup is used to display orders which were selected for settlement -->
  <div class="bill-info">
    <div class="amount">{{orders}}</div>
    <icon-button customColor="#DC143C" icon="receipt" @click.native="$emit('open')"></icon-button>
  </div>
</template>
<script>
import iconButton from "../../components/icon-button.vue";

export default {
  name: "billing",
  components: { iconButton },
  props: ["orders"],
  methods: {}
};
</script>
<style scoped>
.bill-info {
  width: 70%;
  display: flex;
  justify-content: flex-end;
  z-index: 9999;
  position: fixed;
  bottom: 0;
  padding: 1em 10px 10px;
  box-sizing: border-box;
  border-radius: 15px 15px 0px 0px;
}
.bill-info button {
  font-size: 35px;
  height: 2em;
  width: 2em;
  position: fixed;
  z-index: 100;
  bottom: 20px;
  right: 20px;
}
.bill-info .amount {
  font-family: "Raleway";
  font-weight: bold;
  color: #fff;
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 110;
  width: 2em;
  height: 2em;
  bottom: 65px;
  right: 65px;
  background-color: #960d28;
  border-radius: 1em;
}

.slide-leave-active,
.slide-enter-active {
  transition: 1s;
}
.slide-enter {
  transform: translate(0, 100%);
}
.slide-leave-to {
  transform: translate(0, 100%);
}
</style>
