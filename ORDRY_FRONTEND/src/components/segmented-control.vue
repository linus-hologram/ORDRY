<template>
  <div class="control">
    <button
      @click="activeFilter = 'beverages', $emit('filterChanged', activeFilter)"
      :class="{'active': activeFilter == 'beverages', 'inactive': activeFilter != 'beverages' }"
    >Getränke</button>
    <!-- a filter change gets passed on to the product-list and defines the css styling -->
    <button
      @click="activeFilter = 'food', $emit('filterChanged', activeFilter)"
      :class="{'active': activeFilter == 'food', 'inactive': activeFilter != 'food' }"
    >Essen</button>
  </div>
</template>
<script>
export default {
  name: "segmentedControl",
  data() {
    return {
      activeFilter: "beverages" //the default filter is beverages
    };
  }
};
</script>
<style scoped>
.control {
  box-sizing: border-box;
  font-size: 18px;
  display: flex;
  width: 100%;
  min-height: 2em;
  justify-content: center;
  background-color: #14dcb4;
  border-radius: 20px;
  border: 1px solid #14dcb4;
}
.control button {
  flex-basis: 50%;
  border-radius: 20px;
  border: none;
  font-size: 18px;
}
.control button:hover {
  cursor: pointer;
}
.inactive {
  background-color: #14dcb4;
  color: #ffffff;
}
.active {
  background-color: #ffffff;
  color: #14dcb4;
  transition: 1s;
}
</style>
