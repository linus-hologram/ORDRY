<template>
  <div class="input-form">
    <transition name="slide">
      <!-- the filter decides which form is display, this information is passed up all the way from the segmented-control component to the Produkte view and then down here -->
      <!-- if we are in edit mode and there is a pid we pass it down to the child component -->
      <beverageForm v-if="filter == 'beverages'" :bid="pid"></beverageForm>
      <foodForm v-if="filter == 'food'" :fid="pid"></foodForm>
    </transition>
  </div>
</template>
<script>
import beverageForm from "../administration/beverage-form.vue";
import foodForm from "../administration/food-form.vue";

export default {
  name: "inputForm",
  components: {
    beverageForm,
    foodForm
  },
  props: ["filter", "pid"]
};
</script>
<style scoped>
.input-form {
  background-color: #ffffff;
  border-radius: 15px 15px 0 0;
  font-family: "Roboto", Helvetica, Arial, sans-serif;
  font-size: 18px;
  margin: 1em 10px 0;
  flex-basis: 30%;
  flex-grow: 1;
}
</style>
