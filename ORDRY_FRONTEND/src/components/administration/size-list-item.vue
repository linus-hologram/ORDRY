<template>
  <div class="size-item">
    <icon-button
      id="remove"
      icon="minus"
      customColor="#000000"
      @click.native="$emit('delete-size')"
    ></icon-button>
    <!-- I just realised that I might have to rethink my event naming scheme .. -->
    <!-- name + price are passed down as prop form the parent component -->
    <p class="name">{{ name }}</p>
    <p class="price">{{ price }}</p>
  </div>
</template>
<script>
import iconButton from "../icon-button.vue";

export default {
  name: "sizeListItem",
  components: {
    iconButton
  },
  props: ["name", "price"]
};
</script>
<style scoped>
.size-item {
  width: 100%;
  display: flex;
  align-items: center;
  margin: 0.5em 1em;
}
.size-item button {
  margin-right: 10px;
  height: 25px;
  width: 25px;
}
.size-item p {
  font-style: italic;
  margin: 0;
}
.name {
  flex-basis: 60%;
}
.price {
  flex-basis: 40%;
}
</style>
