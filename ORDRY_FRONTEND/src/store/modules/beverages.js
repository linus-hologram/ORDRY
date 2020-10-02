import ProductService from "../../services/ProductService";

export const namespaced = true;

export const state = {
  beverageItems: []
};

export const getters = {
  sortedBeverages: state => {
    return state.beverageItems.sort(function(a, b) {
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
  availableBeverages: (state, getters) => {
    let beveragesWithAvailableSizes = getters.sortedBeverages.filter(bvg => {
      return (
        bvg.sizes.filter(s => {
          return s.available === true;
        }).length > 0
      );
    });

    beveragesWithAvailableSizes.forEach(bvg => {
      bvg.sizes = bvg.sizes.filter(s => {
        return s.available === true;
      });
    });

    return beveragesWithAvailableSizes;
  }
};

export const mutations = {
  SET_BVGITEMS(state, items) {
    state.beverageItems = items;
  },
  DELETE_BVGITEM(state, fid) {
    const newItems = state.beverageItems.filter(food => {
      // delete the food with the id from the state.
      return food._id !== fid;
    });

    state.beverageItems = newItems;
  },
  ADD_BVGITEM(state, item) {
    state.beverageItems.push(item);
  },
  UPDATE_BVGITEM(state, { id, newItem }) {
    let currentItem = state.beverageItems.find(b => {
      return b._id === id;
    });
    currentItem.name = newItem.name;
    currentItem.category = newItem.category;
    currentItem.sizes = newItem.sizes;
  },
  UPDATE_BVGSIZEAVAILABILITY(state, { bid, sid, available }) {
    let currentItem = state.beverageItems.find(b => {
      return b._id === bid;
    });

    let currentSize = currentItem.sizes.find(s => {
      return s._id === sid;
    });
    currentSize.available = available;
  }
};

export const actions = {
  fetchAllBeverages({ commit }) {
    return ProductService.getAllBeverages()
      .then(response => {
        commit("SET_BVGITEMS", response.data);
      })
      .catch(error => {
        console.error(error);
      });
  },
  deleteBeverageWithId({ commit }, bid) {
    ProductService.deleteBeverage(bid)
      .then(response => {
        console.log(response.data);
        commit("DELETE_BVGITEM", bid);
      })
      .catch(error => {
        console.error(error);
      });
  },
  createBeverage({ commit }, beverage) {
    ProductService.createBeverage(
      beverage.name,
      beverage.category,
      beverage.sizes
    )
      .then(response => {
        console.log(response);
        commit("ADD_BVGITEM", response.data.beverage);
      })
      .catch(error => {
        console.log(error);
      });
  },
  updateBeverage({ commit }, beverage) {
    ProductService.updateBeverage(
      beverage.bid,
      beverage.name,
      beverage.category,
      beverage.sizes
    )
      .then(response => {
        console.log(response);
        commit("UPDATE_BVGITEM", {
          id: beverage.bid,
          newItem: {
            name: beverage.name,
            category: beverage.category,
            sizes: beverage.sizes
          }
        });
      })
      .catch(error => {
        console.log(error);
      });
  },
  updateSizeAvailability({ commit }, { bid, sid, available }) {
    return ProductService.updateBeverageSizeAvailability(bid, sid, available)
      .then(response => {
        console.log(response);
        commit("UPDATE_BVGSIZEAVAILABILITY", {
          bid,
          sid,
          available
        });
      })
      .catch(error => {
        console.log(error);
      });
  }
};
