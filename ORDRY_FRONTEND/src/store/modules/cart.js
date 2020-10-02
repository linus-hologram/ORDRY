import OrderService from "../../services/OrderService";

export const namespaced = true;

export const state = () => ({
  forename: "",
  surname: "",
  orderedMenuItems: [],
  orderedFoodItems: [],
  orderedBeverageItems: []
});

export const getters = {
  shoppingCartData: (state, getters, rootState) => {
    let output = [];

    if (rootState) {
      // STEP 1: Loop through all food items and fetch the necessary data
      state.orderedFoodItems.forEach(f => {
        let currentFoodItem = rootState.food.foodItems.find(food => {
          return food._id == f.foodId;
        });

        console.log("CurrentFood is:", currentFoodItem);

        if (currentFoodItem) {
          output.push({
            id: currentFoodItem._id,
            name: currentFoodItem.name,
            price: currentFoodItem.price,
            amount: f.amount,
            type: "food"
          });
        }
      });

      state.orderedBeverageItems.forEach(b => {
        output.push({
          id: b.beverageId + "-" + b.sizeId, // we have to combine them as it wouldn't be a unique key in the component otherwise
          name: b.name + " " + b.sizeName,
          price: b.price,
          amount: b.amount,
          type: "beverage"
        });
      });

      let groupedMenus = [];

      state.orderedMenuItems.forEach(m => {
        let idString =
          m.menuId +
          "-" + // we need this later on for the separation
          m.items
            .map(i => {
              return i.itemId;
            })
            .join("-");

        let groupableMenu = groupedMenus.find(gm => {
          return gm.id === idString;
        });

        if (groupableMenu) {
          groupableMenu.amount++;
          groupableMenu.uuids += "&" + m.uuid; // we need the uuids to clearly delete one ordered menu from the cart
        } else {
          groupedMenus.push({
            id: idString,
            items: m.items,
            amount: 1,
            uuids: m.uuid
          });
        }
      });

      // now we have grouped the menus together and can start fetching the menu data
      groupedMenus.forEach(gm => {
        let currentMenu = rootState.menu.menuItems.find(m => {
          return m._id === gm.id.split("-")[0]; // we get the part before the '-' and that way we get the menu ID
        });

        if (currentMenu) {
          let modifiedItems = [];
          let menuPrice = 0;

          gm.items.forEach(i => {
            let currentItem = currentMenu.food.find(f => {
              return f._id === i.itemId;
            });

            if (currentItem) {
              menuPrice += currentItem.price;
              modifiedItems.push({
                name: currentItem.name,
                price: currentItem.price
              });
            }
          });

          output.push({
            name: currentMenu.name,
            price: menuPrice,
            items: modifiedItems,
            amount: gm.amount,
            uuids: gm.uuids,
            type: "menu"
          });
        }
      });
    }

    return output;
  }
};

export const mutations = {
  SET_GUESTNAME: (state, { forename, surname }) => {
    state.forename = forename;
    state.surname = surname;
  },
  ADD_MENU: (state, menu) => {
    // incoming menu-data structure: {"id":"5d67c4863717433a00d8b0d5","items":["5d6aa7019c1ae908d8c354ad",...]}
    // menu should have the json structure that the api needs
    let modifiedMenu = {};

    modifiedMenu.menuId = menu.id;
    modifiedMenu.items = [];
    modifiedMenu.uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function(c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );

    menu.items.forEach(i => {
      modifiedMenu.items.push({ itemId: i });
    });

    state.orderedMenuItems.push(modifiedMenu);
  },
  ADD_FOODITEM: (state, food) => {
    let modifiedFood = {};

    modifiedFood.foodId = food._id;
    modifiedFood.amount = 1;

    let existingCartedFood = state.orderedFoodItems.find(f => {
      // find an existing food
      return f.foodId == modifiedFood.foodId;
    });

    if (existingCartedFood) {
      existingCartedFood.amount++; // update the amount if found
    } else state.orderedFoodItems.push(modifiedFood); // create a new foodItem in the cart
  },
  ADD_BEVERAGEITEM: (state, beverage) => {
    let modifiedBeverage = {};

    console.log(JSON.stringify(beverage));

    modifiedBeverage.beverageId = beverage._id;
    modifiedBeverage.sizeId = beverage.sizes[0]._id;
    modifiedBeverage.amount = 1;
    modifiedBeverage.name = beverage.name;
    modifiedBeverage.sizeName = beverage.sizes[0].name;
    modifiedBeverage.price = beverage.sizes[0].price;

    let existingCartedBeverage = state.orderedBeverageItems.find(b => {
      return (
        b.beverageId == modifiedBeverage.beverageId &&
        b.sizeId == modifiedBeverage.sizeId
      );
    });

    if (existingCartedBeverage) existingCartedBeverage.amount++;
    else state.orderedBeverageItems.push(modifiedBeverage);
  },
  REMOVE_BVG_FROMCART: (state, beverage) => {
    let bvgID = beverage.id.split("-")[0];
    let sizeId = beverage.id.split("-")[1];

    let currentBeverage = state.orderedBeverageItems.find(b => {
      return b.beverageId == bvgID && b.sizeId == sizeId;
    });

    if (currentBeverage) {
      if (currentBeverage.amount > 1) currentBeverage.amount--;
      else
        state.orderedBeverageItems = state.orderedBeverageItems.filter(b => {
          return b.beverageId != bvgID && b.sizeId != sizeId;
        });
    }
  },
  REMOVE_FOOD_FROMCART: (state, food) => {
    let currentFoodItem = state.orderedFoodItems.find(f => {
      return f.foodId == food.id;
    });

    if (currentFoodItem) {
      if (currentFoodItem.amount > 1) currentFoodItem.amount--;
      else
        state.orderedFoodItems = state.orderedFoodItems.filter(f => {
          return f.foodId != food.id;
        });
    }
  },
  REMOVE_MENU_FROMCART: (state, menu) => {
    state.orderedMenuItems = state.orderedMenuItems.filter(m => {
      return m.uuid != menu.uuids.split("&")[0]; // remove the menu
    });
  },
  CLEAR_STATE: state => {
    state.forename = "";
    state.surname = "";
    state.orderedMenuItems = [];
    state.orderedFoodItems = [];
    state.orderedBeverageItems = [];
  }
};

export const actions = {
  setGuestName({ commit }, { forename, surname }) {
    commit("SET_GUESTNAME", { forename: forename, surname: surname });
  },
  addMenuToCart({ commit }, menuItems) {
    commit("ADD_MENU", menuItems);
  },
  addFoodToCart({ commit }, foodItem) {
    commit("ADD_FOODITEM", foodItem);
  },
  addBeverageToCart({ commit }, beverageItem) {
    // structure of incoming item: {"name":"Sprite","sizes":[{"available":true,"name":"0,3l","price":2,"_id":"5d80e2cefcb81b20743a00b5"}]}
    commit("ADD_BEVERAGEITEM", beverageItem);
  },
  removeProductFromCart({ commit }, product) {
    switch (product.type) {
      case "beverage":
        commit("REMOVE_BVG_FROMCART", product);
        break;
      case "food":
        commit("REMOVE_FOOD_FROMCART", product);
        break;
      case "menu":
        commit("REMOVE_MENU_FROMCART", product);
        break;
      default:
        console.log("Product didn't match any of the available types!");
        break;
    }
  },
  sendOrderToOrdryApi({ commit, state }) {
    // MARK: Implement the OrderService call to create the order
    return OrderService.createOrder(
      state.orderedFoodItems,
      state.orderedMenuItems,
      state.orderedBeverageItems,
      state.forename,
      state.surname
    )
      .then(response => {
        console.log("Successfully sent Order to the Ordry-API: ", response);
        commit("CLEAR_STATE");
      })
      .catch(error => {
        console.error(error);
      });
  },
  clearCart({ commit }) {
    commit("CLEAR_STATE");
  }
};
