import ChecklistService from "../../services/ChecklistService";

export const namespaced = true;

export const state = () => ({
  checklistItems: []
});

export const getters = {
  firstSectionItems: state => {
    // all checklist items of the first section (displayed at the beginning of the day)
    return state.checklistItems.filter(e => {
      return e.sectionId === 0;
    });
  },
  secondSectionItems: state => {
    // all checklist items of the second section (displayed at the end of the day)
    return state.checklistItems.filter(e => {
      return e.sectionId === 1;
    });
  }
};

export const mutations = {
  SET_LISTITEMS(state, items) {
    state.checklistItems = items;
  },
  ADD_ITEM(state, item) {
    state.checklistItems.push(item);
  },
  UPDATE_ITEM(state, item) {
    console.log("Item that will be updated:", item);
    let itemList = state.checklistItems.filter(ci => {
      return ci._id !== item._id;
    });
    itemList.push(item);
    state.checklistItems = itemList;
  },
  UPDATE_POSITIONS(state, items) {
    items.forEach(task => {
      let currentItem = state.checklistItems.find(i => {
        return i._id === task._id;
      });

      if (currentItem) currentItem.position = task.position;
    });
  },
  DELETE_ITEM(state, itemId) {
    state.checklistItems = state.checklistItems.filter(ci => {
      return ci._id !== itemId;
    });
  }
};

export const actions = {
  fetchAllChecklistItems({ commit }) {
    ChecklistService.getAllItems()
      .then(response => {
        commit("SET_LISTITEMS", response.data); // commit the responded items to the state
      })
      .catch(error => {
        console.error(error);
      });
  },
  async createChecklistItem({ commit }, formData) {
    try {
      const response = await ChecklistService.createItem(formData);
      commit("ADD_ITEM", response.data.createdItem);
      return Promise.resolve();
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  async updateItem({ commit }, formData) {
    try {
      const response = await ChecklistService.updateItem(formData);
      commit("UPDATE_ITEM", response.data.item);
      return Promise.resolve();
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  updateItemOrder({ commit }, items) {
    items.forEach((item, index) => {
      item.position = index;
    });

    ChecklistService.updateItemOrder(
      items.map(i => {
        return { id: i._id, position: i.position };
      })
    )
      .then(() => {
        commit("UPDATE_POSITIONS", items);
      })
      .catch(error => {
        console.error(error);
      });
  },
  deleteItem({ commit }, itemId) {
    ChecklistService.deleteItem(itemId).then(response => {
      console.log("Successfully deleted the checklist item:", response);
      commit("DELETE_ITEM", itemId);
    });
  }
};
