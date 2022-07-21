const { createStore } = Vuex;
import { Log, LOG_TYPE_ERROR, LOG_TYPE_INFO } from './logs.js'
import { Alert, ALERT_TYPE_ERROR, ALERT_TYPE_INFO } from './alerts/alerts.js'
import { ALERT_FADE_TIME } from './constants.js'

export function createStrongStore() {
  const store = createStore({
      state () {
        return {
          userProfile: {
              idToken: null,
              picture: null,
              email: null,
              name: null
          },
          hasLoggedOut: false,
          selectedView: null,
          logs: [],
          alerts: [],
          sequence: 0,
          strongholds: [],
        }
      },
      getters: {
        hasUserProfile: state => {
            return state.userProfile.idToken != null;
        }
      },
      mutations: {
        selectView (state, viewName) {
            state.selectedView = viewName;
        },
        setStrongholds (state, strongholds) {
            state.strongholds = strongholds;
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
        },
        setUserProfile (state, userProfile) {
            state.userProfile = userProfile;
        },
        deleteUserProfile (state, userProfile) {
            state.userProfile = {
                  idToken: null,
                  picture: null,
                  email: null,
                  name: null
              };
        },
        setHasLoggedOut(state) {
            state.hasLoggedOut = true;
        }
      },
      actions: {
        handleError ({ dispatch, commit }, error){
            let response = error.response;
            let errorMessage = JSON.stringify(error);
            let logType = LOG_TYPE_ERROR;
            let alertType = ALERT_TYPE_ERROR;
            if (response.status == 401 && response.data == 'Unauthorized') {
                logType = LOG_TYPE_INFO;
                alertType = ALERT_TYPE_INFO;
                errorMessage = 'You must be authenticated to access this resource. Please sign in before proceeding.';
            }
            commit('pushLog', new Log(logType, errorMessage));
            dispatch('pushAlert', new Alert(alertType, errorMessage));
            console.log(error);
        },
        loginUser ({state, commit, dispatch}, payload) {
            let csrfToken = document.getElementsByClassName('csrfToken')[0].innerText;
            axios.post('/authenticate', {
                idToken: payload.idToken,
                _csrf: csrfToken
              })
              .then(function (response) {
                console.log("User logged successfully");
                commit('setUserProfile', {
                    idToken: payload.idToken,
                    picture: payload.picture,
                    name: payload.name,
                    email: payload.email
                });
              })
              .catch(function (error) {
                dispatch('handleError', error);
              });
        },
        logOut ({state, commit, dispatch}) {
            let csrfToken = document.getElementsByClassName('csrfToken')[0].innerText;
            axios
                .post('logout', {
                    _csrf: csrfToken
                })
                .then(function (response) {
                    console.log("User logged out successfully");
                    commit('deleteUserProfile');
                    commit('setHasLoggedOut')
                  })
                  .catch(function (error) {
                    dispatch('handleError', error);
                  });
        },
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
            axios.get('/stronghold')
              .then(function (response) {
                commit('setStrongholds', response.data);
              })
              .catch(function (error) {
                dispatch('handleError', error);
              });
        }
      }
    });
   return store;
}