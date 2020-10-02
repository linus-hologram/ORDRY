import ProductService from "../../services/ProductService";
import OrderService from "../../services/OrderService";

export const namespaced = true;

export const state = () => ({
  menuItems: [],
  unpreparedMenuItems: [],
  preparedMenuItems: []
});

export const getters = {
  sortedMenus: state => {
    return state.menuItems.sort(function(a, b) {
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
  availableMenu: (state, getters) => {
    return getters.sortedMenus.find(m => {
      return m.available === true;
    });
  },
  unpreparedMenuItems: state => {
    let currentMenus = JSON.parse(JSON.stringify(state.menuItems));

    let output = [];

    currentMenus.forEach(m => {
      // loop through all different menu items
      m.food.map(f => {
        // set default count to 0
        f.count = 0;
      });

      let shouldAdd = false;

      state.unpreparedMenuItems.forEach(i => {
        if (i.menuId === m._id) {
          // check if it is the current looped menu
          let currentMenuItem = m.food.find(f => {
            // fetch the currentMenu's food-items
            return f._id === i.itemId;
          });

          if (currentMenuItem && i.count > 0) {
            currentMenuItem.count = i.count;
            shouldAdd = true;
          }
        }
      });

      if (m.available === true || shouldAdd === true) {
        output.push(m);
      }
    });

    return output;
  },
  sortedPreparedMenuItems: state => {
    return state.preparedMenuItems.sort((a, b) => {
      return a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0;
    });
  }
};

export const mutations = {
  ADD_MENUITEM(state, item) {
    state.menuItems.push(item);
  },
  SET_MENUITEMS(state, items) {
    state.menuItems = items;
  },
  UPDATE_MENUAVAILABILITY(state, { id, available }) {
    let currentItem = state.menuItems.find(f => {
      return f._id === id;
    });
    currentItem.available = available;
  },
  UPDATE_MENUITEM(state, { id, newItem }) {
    let currentItem = state.menuItems.find(m => {
      return m._id === id;
    });
    currentItem.name = newItem.name;
    currentItem.food = newItem.food;
    currentItem.available = newItem.available;
  },
  DELETE_MENUITEM(state, mid) {
    const newItems = state.menuItems.filter(menu => {
      // delete the food with the id from the state.
      return menu._id !== mid;
    });

    state.menuItems = newItems;
  },
  SET_UNPREPAREDMENUITEMS(state, items) {
    state.unpreparedMenuItems = [];
    items.forEach(i => {
      state.unpreparedMenuItems.push({
        menuId: i._id.menuId,
        itemId: i._id.itemId,
        count: i.count
      });
    });
  },
  ADD_UNPREPAREDMENUITEMS(state, menus) {
    menus.forEach(i => {
      i.items.forEach(item => {
        let currentItem = state.unpreparedMenuItems.find(m => {
          return m.menuId === i.menuId && m.itemId === item.itemId;
        });

        if (currentItem) currentItem.count++;
        else {
          state.unpreparedMenuItems.push({
            menuId: i.menuId,
            itemId: item.itemId,
            count: 1
          });
        }
      });
    });
  },
  DECREASE_UNPREPAREDMENUITEMCOUNT(
    state,
    { menuId, itemId, rootState, menuOrderId }
  ) {
    let currentItem = state.unpreparedMenuItems.find(m => {
      return m.menuId === menuId && m.itemId === itemId;
    });

    if (rootState.lastPreparedFoodItems.length < 3) {
      rootState.lastPreparedFoodItems.push({
        menuOrderId: menuOrderId,
        item: currentItem,
        type: "menu"
      });
    } else {
      rootState.lastPreparedFoodItems.shift();
      rootState.lastPreparedFoodItems.push({
        menuOrderId: menuOrderId,
        item: currentItem,
        type: "menu"
      });
    }

    currentItem.count -= 1;
  },
  INCREASE_UNPREPAREDMENUITEMCOUNT(state, { menuId, itemId, rootState }) {
    let currentItem = state.unpreparedMenuItems.find(m => {
      return m.menuId === menuId && m.itemId === itemId;
    });

    currentItem.count += 1;
    rootState.lastPreparedFoodItems.pop(); // remove the last item from the prepared food items stack
  },
  SET_PREPAREDMENUITEMS(state, items) {
    state.preparedMenuItems = [];
    items.forEach(i => {
      let currentMenu = state.menuItems.find(m => {
        return m._id === i.menuId;
      });

      if (currentMenu) {
        i.itemId.forEach(id => {
          let currentItem = currentMenu.food.find(f => {
            return f._id === id;
          });
          if (currentItem) {
            state.preparedMenuItems.push({
              mid: i.menuId,
              itemId: currentItem._id,
              name: currentItem.name,
              forename: i.forename,
              surname: i.surname,
              menuOrderId: i._id,
              orderId: i.orderId,
              timestamp: i.timestamp,
              uuid: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
                /[xy]/g,
                function(c) {
                  var r = (Math.random() * 16) | 0,
                    v = c == "x" ? r : (r & 0x3) | 0x8;
                  return v.toString(16);
                }
              )
            });
          }
        });
      }
    });
  },
  MARK_MENUORDERITEMFINISHED(state, { itemUUID, rootState }) {
    let currentItem = state.preparedMenuItems.find(f => {
      return f.uuid === itemUUID;
    });

    if (rootState.lastFinishedFoodItems.length < 3) {
      rootState.lastFinishedFoodItems.push({
        menuOrderId: currentItem.menuOrderId,
        item: currentItem,
        type: "menu"
      });
    } else {
      rootState.lastFinishedFoodItems.shift();
      rootState.lastFinishedFoodItems.push({
        menuOrderId: currentItem.menuOrderId,
        item: currentItem,
        type: "menu"
      });
    }

    state.preparedMenuItems = state.preparedMenuItems.filter(m => {
      return m.uuid !== itemUUID;
    });
  },
  UNDO_MARKMENUORDERITEMFINISHED(state, { rootState, preparedItem }) {
    rootState.lastFinishedFoodItems.pop(); // remove the last finished foodOrderId from the array
    state.preparedMenuItems.push(preparedItem.item); // now we re-add the item again.
  }
};

export const actions = {
  fetchAllMenus({ commit }) {
    return ProductService.getAllMenus()
      .then(response => {
        commit("SET_MENUITEMS", response.data);
      })
      .catch(error => {
        console.error(error);
      });
  },
  updateMenuAvailability({ commit }, { id, available }) {
    return ProductService.updateMenuAvailability(id, available)
      .then(response => {
        console.log(response);
        commit("UPDATE_MENUAVAILABILITY", { id, available });
      })
      .catch(error => {
        console.log(error);
      });
  },
  createMenu({ commit }, { name, available, food }) {
    return ProductService.createMenu(name, available, food)
      .then(response => {
        console.log(response);
        commit("ADD_MENUITEM", response.data.menu);
      })
      .catch(error => {
        console.log(error);
      });
  },
  deleteMenuWithId({ commit }, mid) {
    return ProductService.deleteMenu(mid)
      .then(response => {
        console.log(response.data);
        commit("DELETE_MENUITEM", mid);
      })
      .catch(error => {
        console.error(error);
      });
  },
  updateMenuWithId({ commit }, { mid, name, available, food }) {
    console.log(mid);
    return ProductService.updateMenu(mid, name, available, food)
      .then(response => {
        console.log(response.data);
        commit("UPDATE_MENUITEM", {
          id: mid,
          newItem: { name, available, food }
        });
      })
      .catch(error => {
        console.error(error);
      });
  },
  getOpenMenus({ commit }) {
    return OrderService.getOpenMenuItems()
      .then(response => {
        commit("SET_UNPREPAREDMENUITEMS", response.data.result);
      })
      .catch(error => {
        console.error(error);
      });
  },
  addOpenMenus({ commit }, menus) {
    commit("ADD_UNPREPAREDMENUITEMS", menus);
  },
  markOneMenuPrepared({ commit, dispatch, rootState }, { menuId, itemId }) {
    return OrderService.markOneMenuItemPrepared(menuId, itemId)
      .then(response => {
        console.log("Marked Menu Item prepared: ", response);
        commit("DECREASE_UNPREPAREDMENUITEMCOUNT", {
          menuId: menuId,
          itemId: itemId,
          rootState: rootState,
          menuOrderId: response.data.menuOrderId // the menu Order Id of the freshly prepared menu item
        });
        dispatch("getPreparedMenuItems");
      })
      .catch(error => {
        console.error(error);
      });
  },
  undoLastMenuPrepared({ dispatch, commit, rootState }) {
    let currentFood =
      rootState.lastPreparedFoodItems[
        rootState.lastPreparedFoodItems.length - 1
      ];

    if (currentFood) {
      return OrderService.undoMenuItemPrepared(
        currentFood.menuOrderId,
        currentFood.item.itemId
      )
        .then(response => {
          console.log(
            "Successfully undone the finish mark on the specified food order!",
            response
          );

          commit("INCREASE_UNPREPAREDMENUITEMCOUNT", {
            menuId: currentFood.item.menuId,
            itemId: currentFood.item.itemId,
            rootState: rootState
          });
          dispatch("getPreparedMenuItems");
        })
        .catch(error => {
          console.error(error);
        });
    }
  },
  getPreparedMenuItems({ commit }) {
    return OrderService.getPreparedMenuItemOrders()
      .then(response => {
        console.log("Fetched all prepared menu item orders: ", response);
        commit("SET_PREPAREDMENUITEMS", response.data);
      })
      .catch(error => {
        console.error(error);
      });
  },
  markOneMenuItemFinished(
    { commit, rootState },
    { menuOrderId, itemId, uuid }
  ) {
    return OrderService.markOneMenuItemFinished(menuOrderId, itemId)
      .then(response => {
        console.log("Successfully marked menu Order item finished!", response);
        commit("MARK_MENUORDERITEMFINISHED", {
          itemUUID: uuid,
          rootState: rootState
        });
      })
      .catch(error => {
        console.error(error);
      });
  },
  undoLastMenuItemFinishedMark({ commit, rootState }) {
    let currentFood =
      rootState.lastFinishedFoodItems[
        rootState.lastFinishedFoodItems.length - 1
      ];

    if (currentFood) {
      return OrderService.undoMenuItemFinishedMark(
        currentFood.menuOrderId,
        currentFood.item.itemId
      )
        .then(response => {
          console.log(
            "Successfully undone the menu order item finished mark!",
            response
          );

          commit("UNDO_MARKMENUORDERITEMFINISHED", {
            rootState: rootState,
            preparedItem: currentFood
          });
        })
        .catch(error => {
          console.error(error);
        });
    }
  }
};
