// import ProductService from "../../services/ProductService";

export const namespaced = true;
export const state = () => ({
  username: "",
  password: ""
});

export const getters = {
  getBase64AuthToken: state => {
    let creds = "Basic " + btoa(state.username + ":" + state.password);

    return creds ? creds : "";
  }
};

export const mutations = {
  SET_CREDENTIALS: (state, { username, password }) => {
    state.username = username;
    state.password = password;
  },
  CLEAR_CREDENTIALS: state => {
    state.username = "";
    state.password = "";
  },
  UPDATE_PASSWORD: (state, password) => {
    state.password = password;
  }
};

export const actions = {
  setCredentials({ commit }, { username, password }) {
    commit("SET_CREDENTIALS", { username: username, password: password });
  },
  clearCredentials({ commit }) {
    commit("CLEAR_CREDENTIALS");
  }
};
