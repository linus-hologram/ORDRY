<template>
  <div class="food">
    <!-- We display name and price -->
    <p class="name">{{ food.name }}</p>
    <p class="price">{{ food.price | toCurrency }}</p>
    <!-- We inform the parent which food has been added -->
    <icon-button
      id="plus"
      icon="plus"
      customColor="#dc143c"
      @click.native="addFood"
      v-if="!success"
    ></icon-button>
    <font-awesome-icon v-if="success" icon="check" id="check" />
  </div>
</template>
<script>
import iconButton from "../../components/icon-button.vue";

export default {
  name: "food",
  //We need a food object
  props: ["food"],
  components: { iconButton },
  data() {
    return {
      success: false
    };
  },
  methods: {
    addFood() {
      this.success = true;
      var self = this;
      this.$emit("added", this.food);
      setTimeout(function() {
        self.success = false;
      }, 1000);
    }
  }
};
</script>
<style scoped>
.food {
  display: flex;
  align-items: center;
  width: 90%;
  min-height: 4em;
  padding: 0 5%;
  border-bottom: solid 0.5px #000000;
}
.food p {
  margin: 0;
}
.food button {
  margin-left: auto;
  font-size: 20px;
  height: 2em;
  width: 2em;
}
.food .name {
  flex-basis: 50%;
}
.food .price {
  font-family: "Raleway";
  color: #828282;
}
#check {
  font-size: 2em;
  color: #14dcb4;
  margin-left: auto;
}
</style>
