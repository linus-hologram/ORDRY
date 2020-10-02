import SessionService from "../../services/SessionService";

export const namespaced = true;
export const state = () => ({
  turnover: 0,
  message: ""
});

export const getters = {};

export const mutations = {
  SET_TURNOVER: (state, payload) => {
    state.turnover = payload;
  },
  SET_MESSAGE: (state, payload) => {
    state.message = payload;
  }
};

export const actions = {
  async generateStatistics({ commit, state }) {
    return SessionService.generateStatistics(state.turnover, state.message)
      .then(response => {
        console.log(response.data);
        return Promise.resolve();
      })
      .catch(error => {
        console.error(error);
        return Promise.reject();
      });
  }
};
