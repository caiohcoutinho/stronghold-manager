const { createStore } = Vuex;

export function createStrongStore() {
  const store = createStore({
      state () {
        return {
          loggedUser: null,
          selectedView: null,
        }
      },
      mutations: {
        loginUser (state, payload) {
          state.loggedUser = payload.userId;
        },
        selectView (state, viewName) {
            state.selectedView = viewName;
        }
      }
    });
   return store;
}