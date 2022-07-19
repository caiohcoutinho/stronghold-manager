const { createStore } = Vuex;
import { Log, LOG_TYPE_ERROR } from './logs.js'
import { Alert, ALERT_TYPE_ERROR } from './alerts/alerts.js'
import { ALERT_FADE_TIME } from './constants.js'

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

export function createStrongStore() {
  const store = createStore({
      state () {
        return {
          idToken: null,
          userId: null,
          selectedView: null,
          logs: [],
          alerts: [],
          sequence: 0,
        }
      },
      mutations: {
        loginUser (state, payload) {
            state.idToken = payload.idToken;
            state.userId = payload.userId;
        },
        selectView (state, viewName) {
            state.selectedView = viewName;
        },
        pushLog (state, log) {
            state.logs.push(log);
        },
        pushAlert (state, alert) {
            state.alerts.push(alert);
        },
        popAlert (state, alertId) {
            state.alerts.shift();
        },
        incrementSequence (state) {
            state.sequence++;
        }
      },
      actions: {
        pushAlert ({state, commit}, alert) {
            let id = state.sequence;
            alert.id = id;
            commit('incrementSequence');
            commit('pushAlert', alert);
            setTimeout(() => {
                commit('popAlert');
            }, ALERT_FADE_TIME);
        },
        loadStrongholds ({ dispatch, commit }) {
            axios.get('/user?ID=12345')
              .then(function (response) {
                // handle success
                console.log(response);
              })
              .catch(function (error) {
                commit('pushLog', new Log(LOG_TYPE_ERROR, JSON.stringify(error)));
                dispatch('pushAlert', new Alert(ALERT_TYPE_ERROR, JSON.stringify(error)));
                console.log(error);
              });
        }
      }
    });
   return store;
}