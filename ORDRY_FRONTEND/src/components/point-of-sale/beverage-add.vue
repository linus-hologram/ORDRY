<template>
  <div class="beverage">
    <p class="name">{{name}}</p>
    <!-- If the user clicks on the add button a tooltip with the different size options is displayed -->
    <icon-button id="plus" icon="plus" customColor="#dc143c" @click.native="showSizes=!showSizes"></icon-button>
    <tooltip :visible="showSizes">
      <!-- Inside the tooltip we display a button for every beverage-size -->
      <!-- When the user chooses a size we inform the parent and hide the tooltip again -->
      <button
        v-for="size in sizes"
        :key="size._id"
        class="btn-round"
        @click="$emit('added-bvg', {bid: bid, sid: size._id}), showSizes = false"
      >{{size.name}}</button>
    </tooltip>
  </div>
</template>
<script>
import iconButton from "../../components/icon-button.vue";
import tooltip from "../tooltip.vue";

export default {
  name: "beverage-add",
  components: { iconButton, tooltip },
  //We need the beverageID, its name and its sizes with their IDs and names
  props: ["bid", "name", "sizes"],
  data() {
    return {
      //This defines if the tooltip for the different size options is displayed
      showSizes: false
    };
  }
};
</script>
<style scoped>
.beverage {
  float: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 32%;
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
