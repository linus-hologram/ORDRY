<template>
  <div class="control">
    <button
      @click="activeFilter = 'cold', $emit('filterChanged', activeFilter)"
      :class="{'active': activeFilter == 'cold', 'inactive': activeFilter != 'cold' }"
    >kalt</button>
    <!-- a filter change gets passed on to the product-list and defines the view -->
    <button
      @click="activeFilter = 'warm', $emit('filterChanged', activeFilter)"
      :class="{'active': activeFilter == 'warm', 'inactive': activeFilter != 'warm' }"
    >warm</button>
    <button
      @click="activeFilter = 'alcohol', $emit('filterChanged', activeFilter)"
      :class="{'active': activeFilter == 'alcohol', 'inactive': activeFilter != 'alcohol' }"
    >alkoholisch</button>
  </div>
</template>
<script>
export default {
  name: "segmentedControl",
  data() {
    return {
      activeFilter: "cold" //the default filter is cold beverages
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
  flex-basis: 33.3%;
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
