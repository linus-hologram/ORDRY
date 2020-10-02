import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use(request => {
  console.log("Starting Request", request);
  return request;
});

export default {
  getAllFood() {
    return apiClient.get("/public/getAllFood");
  },
  getAllBeverages() {
    return apiClient.get("/public/getAllBeverages");
  },
  createFood(name, price, available) {
    return apiClient.post("/food/addFood", {
      name: name,
      price: price,
      available: available
    });
  },
  createBeverage(name, category, sizes) {
    return apiClient.post("/beverages/addBeverage", {
      name: name,
      category: category,
      sizes: sizes
    });
  },
  updateFood(id, name, available, price) {
    return apiClient.patch("/food/updateFood", {
      id: id,
      name: name,
      available: available,
      price: price
    });
  },
  updateFoodAvailability(fid, available) {
    return apiClient.patch("/food/updateAvailability", {
      id: fid,
      available: available
    });
  },
  updateBeverage(beverageId, name, category, sizes) {
    return apiClient.patch("/beverages/updateBeverage", {
      name: name,
      category: category,
      sizes: sizes,
      id: beverageId
    });
  },
  updateBeverageSizeAvailability(bid, sid, available) {
    return apiClient.patch("/beverage-sizes/updateSizeAvailability", {
      id: bid,
      sizeId: sid,
      available: available
    });
  },
  deleteFood(foodId) {
    return apiClient.delete("/food/deleteFood", {
      data: {
        id: foodId
      }
    });
  },
  deleteBeverage(beverageId) {
    return apiClient.delete("/beverages/deleteBeverage", {
      data: {
        id: beverageId
      }
    });
  },
  getAllMenus() {
    return apiClient.get("/public/getAllMenus");
  },
  updateMenuAvailability(mid, available) {
    return apiClient.patch("/menu/updateAvailability", {
      id: mid,
      available: available
    });
  },
  deleteMenu(mid) {
    return apiClient.delete("/menu/deleteMenu", { data: { id: mid } });
  },
  createMenu(name, available, food) {
    return apiClient.post("/menu/addMenu", {
      name: name,
      available: available,
      food: food
    });
  },
  updateMenu(id, name, available, food) {
    return apiClient.patch("/menu/updateMenu", {
      id: id,
      name: name,
      available: available,
      food: food
    });
  },
  SET_HEADER_CREDENTIALS(token) {
    apiClient.defaults.headers.common["Authorization"] = token;
  }
};
