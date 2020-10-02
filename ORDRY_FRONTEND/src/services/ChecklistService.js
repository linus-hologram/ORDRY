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
  getAllItems() {
    // fetch all Checklist elements
    return apiClient.get("/checklist/getAll/");
  },
  getChecklistItemsOfSection(id) {
    // unnecessary, but 1h work in total... <3
    return apiClient.get("/checklist/getAllOfSection/" + id);
  },
  updateItemOrder(items) {
    return apiClient.patch("checklist/updateItemOrder/", items);
  },
  createItem(formData) {
    return apiClient.post("checklist/additem/", formData);
  },
  updateItem(formData) {
    return apiClient.patch("checklist/updateItem/", formData);
  },
  deleteItem(itemId) {
    return apiClient.delete("checklist/delete/", {
      data: {
        id: itemId
      }
    });
  },
  SET_HEADER_CREDENTIALS(token) {
    apiClient.defaults.headers.common["Authorization"] = token;
  }
};
