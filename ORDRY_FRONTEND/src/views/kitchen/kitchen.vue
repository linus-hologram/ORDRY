<template>
  <div class="wrapper">
    <div class="counter">
      <div class="head">
        <h1>AUSGABE</h1>
        <!-- This undo button is for the counter list -->
        <icon-button id="undo" icon="undo-alt" customColor="#DC143C" @click.native="undoFinished()"></icon-button>
      </div>
      <div name="counter-items" class="items">
        <!-- We listen for the finished event in order to manipulate the data accordingly -->
        <counter-item
          v-for="item in sortedPreparedFoodItems"
          :key="item.uuid"
          :guestname="item.order.forename + ' ' + item.order.surname"
          :item="item.name"
          :menu="false"
          @finished="finishFoodItem(item)"
        ></counter-item>
        <counter-item
          v-for="item in sortedPreparedMenuItems"
          :key="item.uuid"
          :guestname="item.forename + ' ' + item.surname"
          :item="item.name"
          :menu="true"
          @finished="finishMenuItem(item.menuOrderId, item.itemId, item.uuid)"
        ></counter-item>
        <!-- This marks the end of the counter list-->
        <div class="end" key="x">
          <p>Keine weiteren Bestellungen.</p>
        </div>
      </div>
    </div>
    <div class="food">
      <div class="food-header">
        <h1>BESTELLUNGEN</h1>
        <!-- This undo button is for the unprepared food/menu item numerators -->
        <icon-button id="undo" icon="undo-alt" customColor="#DC143C" @click.native="undoPrepared()"></icon-button>
      </div>
      <!-- Here we fill the orders space with the food numerators -->
      <div class="unprepared-food">
        <!-- We listen for the prepared event in order to manipulate the data accordingly -->
        <unprepared-food
          v-for="item in unpreparedFoodItems"
          :key="item._id"
          :amount="item.open"
          :item="item.name"
          @prepared="prepareFood(item._id)"
        ></unprepared-food>
      </div>
      <!-- the menu numerators are displayed in a dedicated menu section at the bottom of the page 
      We listen for the menu changed event to switch between multiple menus-->
      <transition-group
        leave-active-class="animated fadeOut fast"
        enter-active-class="animated fadeIn fast"
        mode="out-in"
      >
        <unprepared-menu
          v-for="menu in unpreparedMenuItems"
          :key="menu._id"
          :menu="menu"
          :single="unpreparedMenuItems.length"
          @menu-changed="changeMenu"
          @prepared="prepareMenuItem"
          v-show="menu._id == activeMenuData._id"
        ></unprepared-menu>
      </transition-group>
    </div>
    <modal v-if="newConfig" @close="
        (newConfig = false)
      ">
      <template v-slot:header>
        <h2>Neue Konfiguration verfügbar</h2>
      </template>
      <template
        v-slot:body
      >Das Angebot für den heutigen Tag wurde neu konfiguriert! Die Ansicht wurde soeben neu geladen.</template>
    </modal>
  </div>
</template>

<script>
import iconButton from "../../components/icon-button.vue";
import counterItem from "../../components/kitchen/counter-item.vue";
import unpreparedFood from "../../components/kitchen/unprepared-food-item.vue";
import unpreparedMenu from "../../components/kitchen/unprepared-menu.vue";
import modal from "../../components/modal.vue";

import { mapGetters } from "vuex";
import openSocket from "socket.io-client";

export default {
  name: "kitchen",
  components: {
    iconButton,
    counterItem,
    unpreparedFood,
    unpreparedMenu,
    modal
  },
  beforeRouteLeave(to, from, next) {
    this.$store.dispatch("user/clearCredentials");
    next();
  },
  data() {
    return {
      //This is used to switch between multiple menus
      activeMenu: 0,
      //This is the ID of the last finished item, can be used for undo action -> (left undo button)
      lastFinishedID: null,
      //This is the ID of the last prepared food/menu item, can be used for undo action -> (right undo button)
      lastPreparedID: null,
      //This is for displaying a info message if a new configuration has taken place during the day
      newConfig: false
    };
  },
  methods: {
    finishFoodItem(food) {
      console.log("Finished food item: ", food);
      this.$store.dispatch("food/increaseFoodOrderFinished", {
        foodOrderId: food.foodOrderId,
        itemUUID: food.uuid
      });
    },
    finishMenuItem(menuOrderId, itemId, uuid) {
      console.log("Finished menu item: ", itemId, menuOrderId);
      this.$store.dispatch("menu/markOneMenuItemFinished", {
        menuOrderId: menuOrderId,
        itemId: itemId,
        uuid: uuid
      });
    },
    finishItem(fid, menu) {
      if (fid != null) {
        //Here you need to increase the finished amount of this food

        //Afterwards we save the last finished food
        this.lastFinishedID = fid;
      } else if (menu.id != null && menu.mid != null) {
        //Here you need to increase the finished amount of this menu item

        //Afterwards we save the IDs from this last finished menu item as an object
        this.lastFinishedID = { mid: menu.mid, id: menu.id };
      }
      console.log("last finished ID: " + this.lastFinishedID);
    },
    prepareFood(fid) {
      //Here you need to increase the prepared amount of this food
      this.$store.dispatch("food/markOneFoodPrepared", fid);
      //Afterwards we save the last prepared food
      this.lastPreparedID = fid;
      console.log("last prepared ID: " + this.lastPreparedID);
    },
    prepareMenuItem(ids) {
      //Here you need to increase the prepared amount of this menu
      this.$store.dispatch("menu/markOneMenuPrepared", {
        menuId: ids.mid,
        itemId: ids.itemId
      });
      console.log("prepared menu item: ", ids.mid, ids.itemId);
      //Afterwards we save the IDs from this last prepared menu item as an object
      this.lastPreparedID = { mid: ids.mid, id: ids.itemId };
      console.log("last prepared ID: " + this.lastPreparedID);
    },
    undoFinished() {
      //Here you need to undo the last finished action
      //you can user the lastfinishedID to do so
      this.$store.dispatch("undoLastFinishedFoodProduct");
      console.log("Undo finished");
    },
    undoPrepared() {
      //Here you need to undo the last prepared action
      //you can user the lastpreparedID to do so
      // this.$store.dispatch("food/undoLastFoodPreparedMark");
      this.$store.dispatch("undoLastPreparedFoodProduct");
      console.log("Undo prepared");
    },
    changeMenu() {
      //This sets the active menu to the next menu in the list so the user can "loop" through them
      console.log(this.unpreparedMenuItems.length);
      if (this.activeMenu < this.unpreparedMenuItems.length - 1) {
        this.activeMenu++;
      } else if (this.activeMenu >= this.unpreparedMenuItems.length - 1) {
        //If we are at the end of the list, we return to the first item
        this.activeMenu = 0;
      }
    },
    async refreshScreenContent() {
      try {
        await this.$store.dispatch("food/fetchAllFood");
        await this.$store.dispatch("food/getOpenFood");
        await this.$store.dispatch("food/getPreparedFood");
        await this.$store.dispatch("menu/fetchAllMenus");
        await this.$store.dispatch("menu/getOpenMenus");
        await this.$store.dispatch("menu/getPreparedMenuItems");
      } catch (error) {
        console.error(error);
      }
    }
  },
  computed: {
    ...mapGetters("food", ["unpreparedFoodItems", "sortedPreparedFoodItems"]),
    ...mapGetters("menu", ["unpreparedMenuItems", "sortedPreparedMenuItems"]),
    activeMenuData() {
      if (this.unpreparedMenuItems[this.activeMenu]) {
        return this.unpreparedMenuItems[this.activeMenu];
      }

      return this.unpreparedMenuItems[0];
    }
  },
  async created() {
    this.refreshScreenContent();

    const socket = openSocket("http://localhost:3000", {
      upgrade: false,
      transports: ["websocket"],
      reconnection: true,
      forceNew: false
    });
    socket.on("order-placed", data => {
      this.$store.dispatch("food/addOpenFood", data.food);
      this.$store.dispatch("menu/addOpenMenus", data.menus);
    });

    socket.on("config-changed", () => {
      this.refreshScreenContent();
      this.newConfig = true;
    });
  },
  beforeDestroy() {
    clearInterval(this.refreshTimer);
    this.refreshTimer = undefined;
  }
};
</script>

<style scoped>
.wrapper {
  height: 100%;
}
.counter {
  width: 25%;
  margin-right: 5%;
  display: flex;
  flex-direction: column;
  float: left;
  overflow: hidden;
  height: 100%;
}
.counter .head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
}
.counter .items {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
}
.end {
  color: #828282;
  border-top: dotted 4px #828282;
  width: 90%;
  margin: 1em 0 0;
  text-align: center;
  font-style: italic;
}
.food {
  width: 70%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.food-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#undo {
  width: 40px;
  height: 40px;
  font-size: 20px;
}
</style>
