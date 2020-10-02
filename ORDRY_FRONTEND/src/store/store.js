import Vue from "vue";
import Vuex from "vuex";

import * as food from "./modules/food";
import * as beverages from "./modules/beverages";
import * as checklist from "./modules/checklist";
import * as menu from "./modules/menu";
import * as orders from "./modules/orders";
import * as cart from "./modules/cart";
import * as user from "./modules/user";
import * as statistics from "./modules/statistics";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    food,
    beverages,
    checklist,
    menu,
    orders,
    cart,
    user,
    statistics
  },
  state: {
    lastFinishedFoodItems: [],
    lastPreparedFoodItems: []
  },
  mutations: {},
  actions: {
    undoLastFinishedFoodProduct({ dispatch, state }) {
      let currentProduct = state.lastFinishedFoodItems[state.lastFinishedFoodItems.length - 1];

      console.log("reached!");

      if (currentProduct) {
        switch (currentProduct.type) {
          case "menu":
            // make call to undo the last menu finished operation
            console.log("it is a menu!");
            dispatch("menu/undoLastMenuItemFinishedMark");
            break;
          case "food":
            // make call to undo the last food finished operation
            console.log("it is a food");
            dispatch("food/undoLastFoodOrderFinished");
            break;
        }
      } else console.log("There was no current product!");
    },
    undoLastPreparedFoodProduct({ dispatch, state }) {
      let currentProduct = state.lastPreparedFoodItems[state.lastPreparedFoodItems.length - 1];

      console.log("Current product", currentProduct);

      if (currentProduct) {
        switch (currentProduct.type) {
          case "menu":
            // make call to undo the last menu finished operation
            console.log("it is a menu!");
            dispatch("menu/undoLastMenuPrepared");
            break;
          case "food":
            // make call to undo the last food finished operation
            console.log("it is a food");
            dispatch("food/undoLastFoodPreparedMark");
            break;
        }
      } else console.log("There was no current product!");
    }
  }
});
