import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

export default {
  getUserRole() {
    return apiClient.get("/getUserRole/");
  },
  getAllEmployeeUsers() {
    return apiClient.get("/getAllEmployeeUsers/");
  },
  changeUserPassword(username, password) {
    return apiClient.post("/change-password", { newPassword: password, username: username });
  },
  SET_HEADER_CREDENTIALS(token) {
    apiClient.defaults.headers.common["Authorization"] = token;
  }
};
