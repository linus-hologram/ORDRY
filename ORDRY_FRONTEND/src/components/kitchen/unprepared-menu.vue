<template>
  <div class="unprepared-menu">
    <!-- if the user clicks the name of the menu, we tell the parent to display the next menu -->
    <h2 @click="$emit('menu-changed')">
      {{name}}
      <!-- we only show the sorting icon if there is more than one menu -->
      <font-awesome-icon v-if="single > 1" icon="sort" />
    </h2>
    <!-- We listen for the prepared event in order to manipulate the data accordingly -->
    <unprepared-food
      v-for="item in menu.food"
      :key="item._id"
      :amount="item.count"
      :item="item.name"
      :menu="true"
      @prepared="prepared(item._id)"
    ></unprepared-food>
  </div>
</template>

<script>
import unpreparedFood from "../kitchen/unprepared-food-item.vue";

export default {
  name: "unprepared-menu",
  //We need a menu object with id, name and menu-items, that themselfe include id, name, count
  props: ["menu", "single"],
  components: { unpreparedFood },
  methods: {
    prepared(itemId) {
      var ids = {
        mid: this.menu._id,
        itemId: itemId
      };
      this.$emit("prepared", ids);
    }
  },
  computed: {
    name: function() {
      return this.menu.name.toUpperCase();
    }
  }
};
</script>

<style scoped>
.unprepared-menu {
  display: flex;
  width: 70%;
  align-items: center;
  border-top: dotted 4px #828282;
  padding: 1em 0;
  position: absolute;
  bottom: 0;
  right: 0;
}
.unprepared-menu h2 {
  color: #fff;
  font-family: "Raleway";
  font-size: 1.8vw;
  width: 28vw;
  margin-top: 0;
  margin-bottom: 0;
}
.unprepared-menu h2:hover {
  color: #dc143c;
}
</style>

