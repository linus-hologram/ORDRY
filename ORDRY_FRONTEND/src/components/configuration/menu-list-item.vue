<template>
  <div class="menu-item" v-bind:class="{ available: available }" @click="changeAvailability(mid)">
    <div class="top">
      <p class="name">{{name}}</p>
      <font-awesome-icon v-if="available" class="check" icon="check" />
      <!-- We need to tell the parent component which menu we want to edit because this information gets then passed down to the menu popup -->
      <icon-button
        icon="edit"
        customColor="#828282"
        @click.native.stop="$emit('edit', {mid: mid, available: available})"
      ></icon-button>
      <!-- We can delete the menu in this component because there is no need to inform the parent component -->
      <!-- (actually thats BS I think we should inform the parent in order to trigger the validation of the selections) -->
      <!-- So it should be: we can delete the menu inside this component. Afterwards we need to inform the parent component about the change in order to trigger a validation of the current selection (happens inside the method)-->
      <icon-button
        v-show="!activeSession"
        icon="trash-alt"
        customColor="#FF9900"
        @click.native.stop="deleteMenu(mid)"
      ></icon-button>
    </div>
    <ul class="food">
      <li v-for="item in food" :key="item._id">{{item.name}}</li>
    </ul>
  </div>
</template>

<script>
import iconButton from "../icon-button.vue";
import SessionService from "../../services/SessionService";

export default {
  name: "menu-list-item",
  //We need the menuID, its name, availability and its food with names
  props: ["mid", "name", "available", "food"],
  components: { iconButton },
  data() {
    return {
      activeSession: true
    };
  },
  methods: {
    changeAvailability(mid) {
      //Here you need to update the data
      //Since there can only be one available menu I would suggest to set all menus to unavailable first
      //and then change the availability of the this menu to true

      this.$store
        .dispatch("menu/updateMenuAvailability", {
          id: mid,
          available: !this.available
        })
        .then(() => {
          console.log("Menu availability changed: " + mid);
          //We need to inform the parent about the change
          this.$emit("availabilityChanged");
        });
    },
    deleteMenu(mid) {
      //Here you need to delete the menu
      console.log("The menu id is: ", mid);
      this.$store.dispatch("menu/deleteMenuWithId", mid).then(() => {
        //We need to inform the parent component about the change
        //We are using root as a global eventBus here
        //this is neccessary because we can't communicate with the parent directly at this point anymore
        //as we need to wait till the delete action is completed before we emit the event
        //for the validation of the selection to work correctly, the element is removed before we
        //get the chance to listen for the delete event.
        //Therefore we are using a global eventBus which is not depending on the parent child relationship
        this.$root.$emit("deleted-menu");
        console.log("Menu deleted: " + mid);
      });
    }
  },
  async mounted() {
    const sessionActiveResponse = await SessionService.getServiceStatus();
    this.activeSession = sessionActiveResponse.data.active;
  }
};
</script>

<style scoped>
.menu-item {
  border: solid 1px #000000;
  border-radius: 20px;
  width: 30%;
  color: #828282;
  float: left;
  margin: 0.25em 1%;
  cursor: pointer;
}
.menu-item:hover {
  color: black;
}
.top {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-basis: 100%;
  margin: 0.5em 5%;
  flex-wrap: wrap;
}
.top button {
  width: 25px;
  height: 25px;
  justify-self: flex-end;
}
.top button:first-of-type {
  margin-right: 5px;
}
.name {
  font-size: 20px;
  font-weight: 500;
  justify-self: flex-start;
  flex: 2;
  margin: 0;
}
.food {
  font-size: 18px;
}
.check {
  color: #14dcb4;
  margin-right: 5px;
}
.available {
  border: solid 2px #14dcb4;
  color: #000000;
}
</style>
