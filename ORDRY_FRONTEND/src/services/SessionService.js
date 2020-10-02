import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

export default {
  generateStatistics(turnover, message) {
    return apiClient.post("/generateStatistics", {
      turnover: turnover,
      message: message
    });
  },
  getSoleTurover() {
    return apiClient.get("/getSoleTurnover");
  },
  getAllSessions() {
    return apiClient.get("/getAllSessions");
  },
  getServiceStatus() {
    return apiClient.get("/public/isServiceActive/");
  },
  enableService() {
    return apiClient.get("/enableService/");
  },
  disableService() {
    return apiClient.get("/disableService/");
  },
  SET_HEADER_CREDENTIALS(token) {
    apiClient.defaults.headers.common["Authorization"] = token;
  }
};
