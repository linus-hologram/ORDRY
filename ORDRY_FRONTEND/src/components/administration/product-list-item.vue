<template>
  <div class="item">
    <!-- name + details (category/price) are passed down as prop form the parent component -->
    <p class="name">{{ name }}</p>
    <p class="details">{{ details | toCurrency }}</p>
    <div class="actions">
      <!-- needed to use the native event 'cos otherwise click on the button was not detected -->
      <!-- from here the edit + delete events are passend on to the parent components for proper display and data manipulation -->
      <icon-button id="edit" icon="edit" customColor="#828282" @click.native="$emit('edit')"></icon-button>
      <icon-button
        id="delete"
        icon="trash-alt"
        customColor="#FF9900"
        @click.native="$emit('delete')"
      ></icon-button>
    </div>
  </div>
</template>
<script>
import iconButton from "../../components/icon-button.vue";

export default {
  name: "productListItem",
  components: {
    iconButton
  },
  props: ["name", "details"]
};
</script>
<style scoped>
.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  height: 3.5em;
  border-bottom: 0.5px solid #000000;
}
.item p {
  font-size: 18px;
  margin: 0 1.25%;
  flex-basis: 35%;
}
.details {
  font-family: "Raleway";
  color: #828282;
}
.actions {
  display: flex;
  flex-basis: 25%;
  justify-content: flex-end;
}
.actions button {
  margin: 0 5%;
}
</style>
