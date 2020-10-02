import OrderService from "../../services/OrderService";

export const namespaced = true;

export const state = () => ({
  orders: [],
  openBeverageOrderIds: [],
  lastFinishedBeverageOrderIds: []
});

export const getters = {
  openBeverageOrders: (state, getters) => {
    var filtered = getters.timeSortedOrders.filter(function(o) {
      return this.indexOf(o._id) > -1;
    }, state.openBeverageOrderIds);

    return filtered;
  },
  timeSortedOrders: state => {
    return state.orders.sort(function(a, b) {
      return a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0;
    });
  }
};

export const mutations = {
  SET_ORDERITEMS(state, items) {
    state.orders = items;
    console.log("The order data is:", state.orders);
  },
  ADD_ORDERITEM(state, order) {
    state.orders.push(order);
  },
  SET_OPENBVRGORDERIDS(state, ids) {
    state.openBeverageOrderIds = ids;
  },
  ADD_OPENBEVERAGEORDERID(state, id) {
    state.openBeverageOrderIds.push(id);
  },
  REMOVE_OPENBVRGORDERID(state, oid) {
    state.openBeverageOrderIds = state.openBeverageOrderIds.filter(obid => {
      return obid !== oid;
    });
  },
  MARK_ORDERFINISHED(state, id) {
    state.orders = state.orders.filter(o => {
      return o._id !== id;
    });

    state.lastFinishedBeverageOrderIds = state.lastFinishedBeverageOrderIds.filter(
      // in case the id of the paid order is in the array we have to remove it
      oid => {
        return oid !== id;
      }
    );
  },
  MARK_BVRGSFINISHED(state, oid) {
    let order = state.orders.find(o => {
      return o._id === oid;
    });

    order.beverages.forEach(b => {
      b.finished = true;
    });

    if (state.lastFinishedBeverageOrderIds.length >= 3) {
      state.lastFinishedBeverageOrderIds.shift(); // remove the first element
    }

    state.lastFinishedBeverageOrderIds.push(oid);

    console.log(state.orders);
  },
  UPDATE_FINISHEDFOOD(state, foodOrder) {
    let currentOrder = state.orders.find(o => {
      return o._id === foodOrder.orderId;
    });

    if (currentOrder) {
      let currentFood = currentOrder.food.find(f => {
        return f._id === foodOrder.fid;
      });

      if (currentFood) {
        currentFood.finished = foodOrder.finished;
      }
    }
  },
  UPDATE_FINISHEDMENUS(state, menuOrder) {
    let currentOrder = state.orders.find(o => {
      return o._id === menuOrder.orderId
    })

    if (currentOrder) {
      let currentMenu = currentOrder.menus.find(m => {
        return m._id === menuOrder.menuOrderId
      })

      if (currentMenu) {
        currentMenu.items = menuOrder.items
        currentMenu.finished = menuOrder.finished
        console.log("updated!")
      }
    }
  },
  UNDO_LASTBVRGSFINISHED(state, oid) {
    let order = state.orders.find(o => {
      return o._id === oid;
    });

    if (order) {
      order.beverages.forEach(b => {
        b.finished = false;
      });
      state.openBeverageOrderIds.push(oid); // add the order id back to the openOrders Array
      state.lastFinishedBeverageOrderIds.pop(); // after we have successfully undone the operation we remove the id from the array
    }
  }
};

export const actions = {
  async fetchOrders({ commit }) {
    // fetches all UNPAID orders and prepares this module for use by fetching other stuff as well
    try {
      let result = await OrderService.getOpenOrders();

      let currentOrders = result.data.orders;

      await Promise.all(
        currentOrders.map(async o => {
          const beverages = await OrderService.getBeveragesForOrder(o._id);
          o.beverages = beverages.data.beverages;

          const food = await OrderService.getFoodForOrder(o._id);
          o.food = food.data.food;

          const menus = await OrderService.getMenusForOrder(o._id);
          o.menus = menus.data.menus;
        })
      );

      let openBeverageOrdersResult = await OrderService.getOrdersWithOpenBeverages(); // this fetches an array of order ids that have open beverages

      commit("SET_ORDERITEMS", currentOrders); // set the order items
      commit("SET_OPENBVRGORDERIDS", openBeverageOrdersResult.data.orders); // set the openBeverageOrderIds

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },
  addOrder({ commit }, order) {
    commit("ADD_OPENBEVERAGEORDERID", order.order._id);

    let completeOrder = order.order;
    completeOrder.food = order.food;
    completeOrder.beverages = order.beverages;
    completeOrder.menus = order.menus;

    commit("ADD_ORDERITEM", completeOrder);
  },
  markOrderFinished({ commit }, oid) {
    OrderService.markOrderFinished(oid).then(response => {
      console.log(response);
      commit("MARK_ORDERFINISHED", oid);
    });
  },
  updateOrderFoodFinished({ commit }, foodOrder) {
    commit("UPDATE_FINISHEDFOOD", foodOrder);
  },
  updateOrderMenuFinished({ commit }, menuOrder) {
    commit("UPDATE_FINISHEDMENUS", menuOrder)
  },
  markOrderBeveragesFinished({ commit }, oid) {
    OrderService.updateOrderBeveragesStatus(oid, true)
      .then(response => {
        console.log(response);
        commit("MARK_BVRGSFINISHED", oid);
        commit("REMOVE_OPENBVRGORDERID", oid);
      })
      .catch(error => {
        console.error(error);
      });
  },
  undoLastFinishMarkOnBeverageOrder({ commit, state }) {
    if (
      state.lastFinishedBeverageOrderIds.length > 0 &&
      state.lastFinishedBeverageOrderIds[
        state.lastFinishedBeverageOrderIds.length - 1
      ]
    ) {
      let oid =
        state.lastFinishedBeverageOrderIds[
          state.lastFinishedBeverageOrderIds.length - 1
        ];

      OrderService.updateOrderBeveragesStatus(oid, false)
        .then(response => {
          console.log(response);
          commit("UNDO_LASTBVRGSFINISHED", oid);
        })
        .catch(error => {
          console.error(error);
        });
    }
  },
  async saveOrderChanges(
    { dispatch },
    { orderId, newProducts, removeProducts, updateAmountProducts }
  ) {
    try {
      // MARK: Add new products
      await Promise.all(
        newProducts.food.map(async f => {
          // send api call
          await OrderService.addFood(orderId, f.foodId, f.amount); // add the specified amount of food to the order
        })
      );

      await Promise.all(
        newProducts.beverages.map(async b => {
          await OrderService.addBeverage(
            orderId,
            b.beverageId,
            b.sizeId,
            b.amount
          );
        })
      );

      await Promise.all(
        newProducts.menus.map(async m => {
          await OrderService.addMenu(orderId, m.menuId, m.items);
        })
      );

      // MARK: remove ordered Products
      await Promise.all(
        removeProducts.food.map(async f => {
          await OrderService.deleteOneFoodOrder(f);
        })
      );

      await Promise.all(
        removeProducts.beverages.map(async b => {
          await OrderService.deleteOneBeverageOrder(b);
        })
      );

      await Promise.all(
        removeProducts.menus.map(async m => {
          console.log(m);
          await OrderService.deleteOneMenuOrder(m);
        })
      );

      // MARK: update amount of ordered Products
      await Promise.all(
        updateAmountProducts.food.map(async f => {
          await OrderService.updateFoodAmount(f.foodOrderId, f.amount);
        })
      );

      await Promise.all(
        updateAmountProducts.beverages.map(async b => {
          await OrderService.updateBeverageAmount(b.beverageOrderId, b.amount);
        })
      );
    } catch (error) {
      console.error(error);
    } finally {
      dispatch("fetchOrders");
    }
  }
};
