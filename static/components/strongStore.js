const { createStore } = Vuex;

export function createStrongStore() {
  const store = createStore({
      state () {
        return {
          count: 0
        }
      },
      mutations: {
        increment (state) {
          state.count++
        }
      }
    });
   return store;
}