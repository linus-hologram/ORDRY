<template>
  <div class="beverage">
    <p class="name">{{name}}</p>
    <!-- If this button is clicked we tell the parent which food has been added -->
    <icon-button
      id="plus"
      icon="plus"
      customColor="#dc143c"
      @click.native="$emit('added-food', fid)"
    ></icon-button>
  </div>
</template>
<script>
import iconButton from "../../components/icon-button.vue";

export default {
  name: "food-add",
  components: { iconButton },
  //We need a foodID and a name
  props: ["fid", "name"],
  data() {
    return {};
  }
};
</script>
<style scoped>
.beverage {
  float: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 48%;
  border-bottom: solid 1px #828282;
  position: relative;
  margin-right: 1%;
}
.beverage #plus {
  height: 25px;
  width: 25px;
}
.beverage .btn-round:last-child {
  margin-bottom: 0;
}
.beverage .btn-round {
  width: 80%;
  margin-bottom: 0.5em;
  font-size: 14px;
}
</style>
