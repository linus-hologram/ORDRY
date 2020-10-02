import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

export default {
  getOpenOrders() {
    return apiClient.get("/order/getUnpaid");
  },
  getBeveragesForOrder(orderId) {
    return apiClient.get("order/beverages/getBeverages/" + orderId);
  },
  getFoodForOrder(orderId) {
    return apiClient.get("order/food/getFoodForOrder/" + orderId);
  },
  getMenusForOrder(orderId) {
    return apiClient.get("order/menus/getMenusForOrder/" + orderId);
  },
  getOrdersWithOpenBeverages() {
    return apiClient.get("order/beverages/getOrdersWithOpenBeverages");
  },
  markOrderFinished(oid) {
    // pay an order
    return apiClient.patch("order/markOrderFinished", {
      orderId: oid
    });
  },
  updateOrderBeveragesStatus(oid, status) {
    return apiClient.patch("order/beverages/updateOrderBeveragesStatus", {
      id: oid,
      status: status
    });
  },
  addFood(orderId, foodId, amount) {
    return apiClient.post("order/food/createFood", {
      fid: foodId,
      orderId: orderId,
      amount: amount
    });
  },
  addBeverage(orderId, beverageId, sizeId, amount) {
    console.log(orderId, beverageId, sizeId, amount);
    return apiClient.post("order/beverages/createBeverage", {
      orderId: orderId,
      sizeId: sizeId,
      bid: beverageId,
      amount: amount
    });
  },
  addMenu(orderId, menuId, items) {
    return apiClient.post("order/menus/addMenu", {
      orderId: orderId,
      menuId: menuId,
      items: items
    });
  },
  updateBeverageAmount(beverageOrderId, amount) {
    return apiClient.patch("order/beverages/updateBeverageAmount", {
      beverageOrderId: beverageOrderId,
      amount: amount
    });
  },
  updateFoodAmount(foodOrderId, amount) {
    return apiClient.patch("order/food/updateAmount", {
      foodOrderId: foodOrderId,
      amount: amount
    });
  },
  deleteOneBeverageOrder(beverageOrderId) {
    return apiClient.delete("order/beverages/deleteOneBeverage", {
      data: {
        beverageOrderId: beverageOrderId
      }
    });
  },
  deleteOneFoodOrder(foodOrderId) {
    return apiClient.delete("order/food/deleteOneFood", {
      data: {
        foodOrderId: foodOrderId
      }
    });
  },
  deleteOneMenuOrder(menuOrderId) {
    return apiClient.delete("order/menus/deleteOneMenu", {
      data: {
        menuOrderId: menuOrderId
      }
    });
  },
  getOpenFood() {
    return apiClient.get("order/food/getOpenFood");
  },
  getOpenMenuItems() {
    return apiClient.get("order/menus/getAllUnprepared");
  },
  markOneFoodPrepared(foodId) {
    return apiClient.patch("order/food/increasePrepared", {
      foodId: foodId
    });
  },
  undoFoodPreparedMark(foodOrderId) {
    return apiClient.patch("order/food/decreasePrepared", {
      foodOrderId: foodOrderId
    });
  },
  getPreparedFoodOrders() {
    return apiClient.get("order/food/getAllPrepared");
  },
  increaseFoodOrderFinished(foodOrderId) {
    return apiClient.patch("order/food/increaseFinished", {
      foodOrderId: foodOrderId
    });
  },
  undoIncreaseFoodOrderFinished(foodOrderId) {
    return apiClient.patch("order/food/decreaseFinished", {
      foodOrderId: foodOrderId
    });
  },
  markOneMenuItemPrepared(menuId, itemId) {
    return apiClient.patch("order/menus/markMenuPrepared", {
      menuId: menuId,
      itemId: itemId
    });
  },
  undoMenuItemPrepared(menuOrderId, itemId) {
    console.log(menuOrderId, itemId);
    return apiClient.patch("order/menus/undoMenuPreparedMark", {
      menuOrderId: menuOrderId,
      itemId: itemId
    });
  },
  getPreparedMenuItemOrders() {
    return apiClient.get("order/menus/getAllPrepared");
  },
  markOneMenuItemFinished(menuOrderId, itemId) {
    return apiClient.patch("order/menus/markMenuFinished", {
      menuOrderId: menuOrderId,
      itemId: itemId
    });
  },
  undoMenuItemFinishedMark(menuOrderId, itemId) {
    return apiClient.patch("order/menus/undoMarkMenuFinished", {
      menuOrderId: menuOrderId,
      itemId: itemId
    });
  },
  createOrder(orderedFood, orderedMenus, orderedBeverages, forename, surname) {
    return apiClient.post("/public/create-order", {
      forename: forename,
      surname: surname,
      food: orderedFood,
      beverages: orderedBeverages,
      menus: orderedMenus
    });
  },
  SET_HEADER_CREDENTIALS(token) {
    apiClient.defaults.headers.common["Authorization"] = token;
  }
};
