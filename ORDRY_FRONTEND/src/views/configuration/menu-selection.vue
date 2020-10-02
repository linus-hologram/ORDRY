<template>
  <div class="wrapper">
    <h2>Auswahl Tagesmenü</h2>
    <div class="menus">
      <!-- This field is used to create new menus -->
      <div class="new-menu" @click="newMenu()">
        <p>Neues Menü erstellen</p>
        <icon-button icon="plus" customColor="#DC143C" @click.native="newMenu()"></icon-button>
      </div>
      <!-- The menu popup is used for creating new menus or updating existing menus, depending a 'full or empty' menuID -->
      <!-- We listen for the close event in order to hide the popup again. At the same time we need to reset the editMID -->
      <menu-modal
        v-if="showModal"
        @close="showModal = false, editMid = null, editAvailability = null"
        :mid="editMid"
        :available="editAvailability"
      ></menu-modal>
      <!-- This field is used if the user does not want to offer a menu for the day -->
      <div class="no-menu" v-bind:class="{active : noMenu}" @click="noMenuSelected()">
        <div class="top">
          <p class="name">KEIN Tagesmenü</p>
          <font-awesome-icon v-if="noMenu" class="check" icon="check" />
        </div>
        <p class="text">Es wird heute kein Tagesmenü für die Gäste angeboten.</p>
      </div>
      <!-- Every time the availability of a menu changes or a menu is deleted we need to update the number of selected menus -->
      <!-- We also listen for the edit event, which gets triggred by the edit button within the menu item component in order to display the menu popup-->
      <menuItem
        v-for="item in sortedMenus"
        :key="item._id"
        :mid="item._id"
        :name="item.name"
        :food="item.food"
        :available="item.available"
        @availabilityChanged="updateSelection()"
        @edit="editMenu"
        @delete="updateSelection()"
      ></menuItem>
    </div>
    <div class="navigation">
      <!-- this button replaces the current route with the last step in the configuration -->
      <button
        id="back-btn"
        class="btn-round"
        @click="$router.replace('speisen'), $emit('activated', 3)"
      >Zurück</button>
      <div class="next">
        <p class="info" v-show="!selected">Bitte wählen Sie eine Option für das Tagesmenü aus.</p>
        <!-- this button replaces the current route with the next step in the configuration -->
        <!-- the activated event tells the parent component (configuration.vue) which step of the stepper needs to be active -->
        <!-- it is not possible to continue with the configuration if there is not excatly ONE option for the menus selected -->
        <button
          id="next-btn"
          class="btn-round"
          @click="$router.replace('erfolgreich'), $emit('activated', 5)"
          :disabled="!selected"
        >Weiter</button>
      </div>
    </div>
  </div>
</template>
<script>
import menuItem from "../../components/configuration/menu-list-item.vue";
import iconButton from "../../components/icon-button.vue";
import menuModal from "../../components/configuration/menu-modal.vue";

import { mapGetters } from "vuex";

export default {
  name: "menu-selection",
  components: { menuItem, iconButton, menuModal },
  data() {
    return {
      // This tells us if the no-menu-option is selected
      noMenu: false,
      // This is true when there is excatly ONE menu option selected, otherwise the value is false
      selected: false,
      // This is needed in order to trigger the popup
      showModal: false,
      // This is the ID of the menu that is currently edited, it gets reset after the edit/create process
      editMid: null,
      // This is the availability of the menu that is currently edited
      editAvailability: null
    };
  },
  methods: {
    updateSelection() {
      //This is used in order to validate if there is excatly ONE option selected
      //It should be unnecessary for the most part because we already try to only have one option selected in most cases, but doesn't hurt to check
      //You maybe need to modify this a little due to the actual data structure
      var selections = 0;
      //First we are counting how many existing menus are selected
      this.sortedMenus.forEach(menu => {
        if (menu.available) {
          selections++;
          console.log("increased selection count " + selections);
        }
      });
      //If the no-menu-option is selected we increase the number of selections as well
      if (this.noMenu) {
        console.log("no menu selected");
        selections++;
      }
      //The selections is only valid if excatly ONE option is selected, otherwise the user cannot continue with the config process and a msg gets displayed
      if (selections == 1) {
        this.selected = true;
      } else {
        this.selected = false;
      }

      console.log("Updated selection: " + selections);
    },
    noMenuSelected() {
      //Here you need to change the availability of all existing menus to false because the user does not want to offer a menu today
      if (this.noMenu == true) {
        this.noMenu = false;
        this.updateSelection();
      } else if (this.noMenu == false) {
        this.noMenu = true;
        this.sortedMenus.forEach(m => {
          this.$store
            .dispatch("menu/updateMenuAvailability", {
              id: m._id,
              available: false
            })
            .then(() => {
              this.updateSelection();
            });
        });
      }
    },
    newMenu() {
      //The popup for creating a new menu is displayed
      this.showModal = true;
    },
    editMenu(menu) {
      //The popup for editing a existing menu is displayed
      //The actual data manipulation takes places inside the menu-modal component
      this.editMid = menu.mid;
      this.editAvailability = menu.available;
      this.showModal = true;
    }
  },
  computed: {
    ...mapGetters("menu", ["sortedMenus"])
  },
  created() {
    //When the component is created we need to validate the selection
    this.$store.dispatch("menu/fetchAllMenus").then(() => {
      this.updateSelection();
    });

    //We need to handle the deleted-menu event here because it is not attached to a specific component
    //since it was emitted to a global eventBus instead
    this.$root.$on("deleted-menu", this.updateSelection);
  },
  beforeDestroy() {
    //We need to detache the event handler again before the component is destroyed
    //because the event is not attached to a component so this is not happening automatically
    this.$root.$off("deletedMenu");
  }
};
</script>
<style scoped>
h2 {
  margin-left: 2%;
  align-self: flex-start;
}
.wrapper {
  background-color: #ffffff;
  border-radius: 15px 15px 0 0;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  align-items: center;
  justify-content: space-between;
  overflow-y: auto;
}
.menus {
  width: 80%;
  height: 70%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
.navigation {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 1em;
}
.next {
  align-self: flex-end;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap-reverse;
  justify-content: flex-end;
  align-items: center;
  width: 50%;
}
#next-btn,
#back-btn {
  width: 150px;
  height: 40px;
  margin: 0 10px;
}

.no-menu {
  border: solid 1px #000000;
  border-radius: 20px;
  width: 30%;
  color: #828282;
  margin: 0.25em 1%;
  cursor: pointer;
}
.no-menu:hover {
  color: black;
}
.no-menu .top {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-basis: 100%;
  margin: 0.5em 5%;
  flex-wrap: wrap;
}
.no-menu .name {
  font-size: 20px;
  font-weight: 500;
  justify-self: flex-start;
  flex: 2;
  margin: 0;
}
.no-menu .text {
  display: block;
  margin: 1em 5%;
}
.no-menu .check {
  color: #14dcb4;
  margin-right: 5px;
}
.active {
  border: solid 2px #14dcb4;
  color: #000000;
}

.new-menu {
  border: dashed 1px #000000;
  border-radius: 20px;
  width: 30%;
  color: #828282;
  margin: 0.25em 1%;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 20px;
  font-style: italic;
  padding-bottom: 1em;
}
.new-menu:hover {
  border: solid 1px #dc143c;
  color: #dc143c;
  font-style: normal;
}
</style>