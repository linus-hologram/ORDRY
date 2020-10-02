import ProductService from "../../services/ProductService";
import OrderService from "../../services/OrderService";

export const namespaced = true;

export const state = {
  foodItems: [],
  unpreparedFoodItems: [],
  preparedFoodItems: []
};

export const getters = {
  sortedFood: state => {
    return state.foodItems.sort(function(a, b) {
      const itemA = a.name.toUpperCase();
      const itemB = b.name.toUpperCase();

      let comparison = 0;
      if (itemA > itemB) {
        comparison = 1;
      } else if (itemA < itemB) {
        comparison = -1;
      }
      return comparison;
    });
  },
  availableFood: (state, getters) => {
    return getters.sortedFood.filter(f => {
      return f.available === true;
    });
  },
  unpreparedFoodItems: state => {
    let food = JSON.parse(JSON.stringify(state.foodItems));
    let output = [];

    food.map(f => {
      // all foods should have 0 open by default
      f.open = 0;
    });

    food.forEach(f => {
      let currentUnprepItem = state.unpreparedFoodItems.find(i => {
        return i._id === f._id;
      });

      if (currentUnprepItem) {
        f.open = currentUnprepItem.open;
      }

      if (f.available == true || f.open > 0) {
        output.push(f);
      }
    });

    return output;
  },
  sortedPreparedFoodItems: state => {
    return state.preparedFoodItems.sort((a, b) => {
      return a.preparedAt < b.preparedAt
        ? -1
        : a.preparedAt > b.preparedAt
        ? 1
        : 0;
    });
  }
};

export const mutations = {
  SET_FOODITEMS(state, items) {
    state.foodItems = items;
  },
  DELETE_FOODITEM(state, fid) {
    const newItems = state.foodItems.filter(food => {
      // delete the food with the id from the state.
      return food._id !== fid;
    });

    state.foodItems = newItems;
  },
  ADD_FOODITEM(state, item) {
    state.foodItems.push(item);
  },
  UPDATE_FOODITEM(state, { id, newItem }) {
    let currentItem = state.foodItems.find(f => {
      return f._id === id;
    });
    currentItem.name = newItem.name;
    currentItem.price = newItem.price;
    currentItem.available = newItem.available;
  },
  UPDATE_FOODAVAILABILITY(state, { id, available }) {
    let currentItem = state.foodItems.find(f => {
      return f._id === id;
    });
    currentItem.available = available;
  },
  SET_UNPREPAREDFOODITEMS(state, items) {
    let adjustedItems = [];
    items.forEach(i => {
      adjustedItems.push({ _id: i._id, open: i.open });
    });
    state.unpreparedFoodItems = adjustedItems;
  },
  ADD_UNPREPAREDFOOD(state, items) {
    items.forEach(i => {
      let currentItem = state.unpreparedFoodItems.find(f => {
        return f._id === i.foodId;
      });

      if (currentItem) {
        currentItem.open += i.amount;
      } else
        state.unpreparedFoodItems.push({
          _id: i.foodId,
          open: i.amount
        });
    });
  },
  DECREASE_OPENFOODCOUNT(state, { foodId, foodOrderId, rootState }) {
    let currentFood = state.unpreparedFoodItems.find(f => {
      return f._id === foodId;
    });

    if (currentFood) {
      currentFood.open -= 1;

      if (rootState.lastPreparedFoodItems.length < 3)
        rootState.lastPreparedFoodItems.push({
          foodOrderId: foodOrderId,
          foodId: foodId,
          type: "food"
        });
      else {
        rootState.lastPreparedFoodItems.shift();
        rootState.lastPreparedFoodItems.push({
          foodOrderId: foodOrderId,
          foodId: foodId,
          type: "food"
        });
      }
    }
  },
  INCREASE_OPENFOODCOUNT(state, { foodId, rootState }) {
    let currentFood = state.unpreparedFoodItems.find(f => {
      return f._id === foodId;
    });
    if (currentFood) {
      currentFood.open += 1;

      rootState.lastPreparedFoodItems.pop();
    }
  },
  SET_PREPAREDITEMS(state, items) {
    state.preparedFoodItems = [];
    items.forEach(i => {
      i.order = i.order[0]; // we need to get the order values, which are stored in an array

      let currentFood = state.foodItems.find(f => {
        // fetch the name of the current food
        return f._id === i.foodId;
      });
      i.name = currentFood.name;

      for (let a = 0; a < i.preparedAmount; a++) {
        let itemCopy = JSON.parse(JSON.stringify(i)); // we need to create an item copy as every item needs a unique id.
        itemCopy.uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          function(c) {
            var r = (Math.random() * 16) | 0,
              v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          }
        );
        state.preparedFoodItems.push(itemCopy);
      }
    });
  },
  INCREASE_FOODORDERFINISHED(state, { itemUUID, foodOrderId, rootState }) {
    let currentItem = state.preparedFoodItems.find(f => {
      return f.uuid === itemUUID;
    });

    if (rootState.lastFinishedFoodItems.length < 3) {
      rootState.lastFinishedFoodItems.push({
        foodOrderId: foodOrderId,
        item: currentItem,
        type: "food"
      });
    } else {
      rootState.lastFinishedFoodItems.shift();
      rootState.lastFinishedFoodItems.push({
        foodOrderId: foodOrderId,
        item: currentItem,
        type: "food"
      });
    }

    state.preparedFoodItems = state.preparedFoodItems.filter(f => {
      // if there are no prepared fooditems left, remove it from the array
      return f.uuid !== itemUUID;
    });
  },
  DECREASE_FOODORDERFINISHED(state, { rootState, preparedItem }) {
    rootState.lastFinishedFoodItems.pop(); // remove the last finished foodOrderId from the array
    state.preparedFoodItems.push(preparedItem.item); // now we re-add the item again.
  }
};

export const actions = {
  fetchAllFood({ commit }) {
    return ProductService.getAllFood()
      .then(response => {
        commit("SET_FOODITEMS", response.data);
      })
      .catch(error => {
        console.error(error);
      });
  },
  deleteFoodWithId({ commit }, fid) {
    ProductService.deleteFood(fid)
      .then(response => {
        console.log(response.data);
        commit("DELETE_FOODITEM", fid);
      })
      .catch(error => {
        console.error(error);
      });
  },
  createFood({ commit }, food) {
    ProductService.createFood(food.name, food.price, food.available)
      .then(response => {
        console.log(response);
        commit("ADD_FOODITEM", response.data.food);
      })
      .catch(error => {
        console.log(error);
      });
  },
  updateFood({ commit }, food) {
    ProductService.updateFood(food.fid, food.name, true, food.price)
      .then(response => {
        console.log(response);
        commit("UPDATE_FOODITEM", {
          id: food.fid,
          newItem: { name: food.name, price: food.price, available: true }
        });
      })
      .catch(error => {
        console.log(error);
      });
  },
  updateFoodAvailability({ commit }, { id, available }) {
    return ProductService.updateFoodAvailability(id, available)
      .then(response => {
        console.log(response);
        commit("UPDATE_FOODAVAILABILITY", { id, available });
      })
      .catch(error => {
        console.log(error);
      });
  },
  getOpenFood({ commit }) {
    return OrderService.getOpenFood()
      .then(response => {
        // console.log("Fetched open food:", response);
        commit("SET_UNPREPAREDFOODITEMS", response.data.openFood);
      })
      .catch(error => {
        console.error(error);
      });
  },
  addOpenFood({ commit }, food) {
    commit("ADD_UNPREPAREDFOOD", food);
  },
  markOneFoodPrepared({ commit, dispatch, rootState }, foodId) {
    return OrderService.markOneFoodPrepared(foodId)
      .then(response => {
        console.log("Marked one Food prepared: ", response);
        commit("DECREASE_OPENFOODCOUNT", {
          foodId: foodId,
          foodOrderId: response.data.foodOrderId,
          rootState: rootState
        });
        dispatch("getPreparedFood"); // every time a food has been marked as prepared, we fetch the full list of prepared food
      })
      .catch(error => {
        console.error(error);
      });
  },
  undoLastFoodPreparedMark({ commit, dispatch, rootState }) {
    let currentFood =
      rootState.lastPreparedFoodItems[
        rootState.lastPreparedFoodItems.length - 1
      ];

    if (currentFood) {
      return OrderService.undoFoodPreparedMark(currentFood.foodOrderId).then(
        response => {
          console.log(
            "Successfully undone the last food prepared mark!",
            response
          );
          commit("INCREASE_OPENFOODCOUNT", {
            foodId: currentFood.foodId,
            rootState: rootState
          });
          dispatch("getPreparedFood");
        }
      );
    }
  },
  getPreparedFood({ commit }) {
    return OrderService.getPreparedFoodOrders()
      .then(response => {
        // console.log("Fetched the prepared food orders", response);
        commit("SET_PREPAREDITEMS", response.data.result);
      })
      .catch(error => {
        console.error(error);
      });
  },
  increaseFoodOrderFinished({ commit, rootState }, { foodOrderId, itemUUID }) {
    return OrderService.increaseFoodOrderFinished(foodOrderId)
      .then(response => {
        console.log(
          "Increased the finished field of the specified food order:",
          response
        );
        // console.log("Root state is", rootState);
        commit("INCREASE_FOODORDERFINISHED", {
          itemUUID: itemUUID,
          foodOrderId: foodOrderId,
          rootState: rootState
        });
      })
      .catch(error => {
        console.error(error);
      });
  },
  undoLastFoodOrderFinished({ commit, rootState }) {
    // implement the OrderService call & mutations.
    let currentFood =
      rootState.lastFinishedFoodItems[
        rootState.lastFinishedFoodItems.length - 1
      ];

    if (currentFood) {
      return OrderService.undoIncreaseFoodOrderFinished(currentFood.foodOrderId)
        .then(response => {
          console.log(
            "Successfully undone the finish mark on the specified food order!",
            response
          );

          commit("DECREASE_FOODORDERFINISHED", {
            preparedItem: currentFood,
            rootState: rootState
          });
        })
        .catch(error => {
          console.error(error);
        });
    }
  }
};
