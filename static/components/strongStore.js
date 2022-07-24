const { createStore } = Vuex;
import { Log, LOG_TYPE_ERROR, LOG_TYPE_WARNING, LOG_TYPE_INFO } from './logs.js'
import { Alert, ALERT_TYPE_ERROR, ALERT_TYPE_WARNING, ALERT_TYPE_INFO } from './alerts/alerts.js'
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
          scenarios: [],
          recipes: [],
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
        setScenarios (state, scenarios) {
            state.scenarios = scenarios;
        },
        setResources (state, resources) {
            state.resources = resources;
        },
        setRecipes (state, recipes) {
            state.recipes = recipes;
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
            if (response.status == 500
                && response.data.includes('violates foreign key constraint "stronghold_scenario_id"')){
                logType = LOG_TYPE_WARNING;
                alertType = ALERT_TYPE_WARNING;
                errorMessage = 'There are strongholds referencing this scenario. Remove the strongholds first.';
            }
            if (response.status == 500
                && response.data.includes('violates foreign key constraint "resource_scenario_id"')){
                logType = LOG_TYPE_WARNING;
                alertType = ALERT_TYPE_WARNING;
                errorMessage = 'There are resources referencing this scenario. Remove the resources first.';
            }
            if (response.status == 500
                && response.data.includes('violates foreign key constraint "recipe_scenario_id"')){
                logType = LOG_TYPE_WARNING;
                alertType = ALERT_TYPE_WARNING;
                errorMessage = 'There are recipes referencing this scenario. Remove the recipe first.';
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
        },
        addNewStronghold({dispatch, commit}, payload) {
            let csrfToken = document.getElementsByClassName('csrfToken')[0].innerText;
            axios.post('/stronghold',  {
                  name: payload.name,
                  _csrf: csrfToken
              })
              .then(function (response) {
                dispatch('loadStrongholds');
              })
              .catch(function (error) {
                dispatch('handleError', error);
              });
        },
        deleteStronghold({dispatch, commit}, stronghold) {
            let csrfToken = document.getElementsByClassName('csrfToken')[0].innerText;
            axios.delete('/stronghold',  { data: {
                  stronghold: stronghold,
                  _csrf: csrfToken
              }})
              .then(function (response) {
                dispatch('loadStrongholds');
              })
              .catch(function (error) {
                dispatch('handleError', error);
              });
        },
        updateStronghold({dispatch, commit}, stronghold) {
           stronghold.loading = true;
           let csrfToken = document.getElementsByClassName('csrfToken')[0].innerText;
           axios.put('/stronghold',  {
                 stronghold: stronghold,
                 _csrf: csrfToken
             })
             .then(function (response) {
               dispatch('loadStrongholds');
               stronghold.loading = false;
             })
             .catch(function (error) {
               dispatch('handleError', error);
               stronghold.loading = false;
             });
        },
        loadScenarios ({ dispatch, commit }) {
            axios.get('/scenario')
              .then(function (response) {
                commit('setScenarios', response.data);
              })
              .catch(function (error) {
                dispatch('handleError', error);
              });
        },
        addNewScenario({dispatch, commit}, payload) {
            let csrfToken = document.getElementsByClassName('csrfToken')[0].innerText;
            axios.post('/scenario',  {
                  name: payload.name,
                  _csrf: csrfToken
              })
              .then(function (response) {
                dispatch('loadScenarios');
              })
              .catch(function (error) {
                dispatch('handleError', error);
              });
        },
        deleteScenario({dispatch, commit}, scenario) {
            let csrfToken = document.getElementsByClassName('csrfToken')[0].innerText;
            axios.delete('/scenario',  { data: {
                  scenario: scenario,
                  _csrf: csrfToken
              }})
              .then(function (response) {
                dispatch('loadScenarios');
              })
              .catch(function (error) {
                dispatch('handleError', error);
              });
        },
        updateScenario({dispatch, commit}, scenario) {
           scenario.loading = true;
           let csrfToken = document.getElementsByClassName('csrfToken')[0].innerText;
           axios.put('/scenario',  {
                 scenario: scenario,
                 _csrf: csrfToken
             })
             .then(function (response) {
               dispatch('loadStrongholds');
               scenario.loading = false;
             })
             .catch(function (error) {
               dispatch('handleError', error);
               scenario.loading = false;
             });
        },
        loadResources ({ dispatch, commit }) {
            axios.get('/resource')
              .then(function (response) {
                commit('setResources', response.data);
              })
              .catch(function (error) {
                dispatch('handleError', error);
              });
        },
        addNewResource({dispatch, commit}, payload) {
            let csrfToken = document.getElementsByClassName('csrfToken')[0].innerText;
            axios.post('/resource',  {
                  name: payload.name,
                  _csrf: csrfToken
              })
              .then(function (response) {
                dispatch('loadResources');
              })
              .catch(function (error) {
                dispatch('handleError', error);
              });
        },
        deleteResource({dispatch, commit}, resource) {
            let csrfToken = document.getElementsByClassName('csrfToken')[0].innerText;
            axios.delete('/resource',  { data: {
                  resource: resource,
                  _csrf: csrfToken
              }})
              .then(function (response) {
                dispatch('loadResources');
              })
              .catch(function (error) {
                dispatch('handleError', error);
              });
        },
        updateResource({dispatch, commit}, resource) {
           resource.loading = true;
           let csrfToken = document.getElementsByClassName('csrfToken')[0].innerText;
           axios.put('/resource',  {
                 resource: resource,
                 _csrf: csrfToken
             })
             .then(function (response) {
               dispatch('loadResources');
               resource.loading = false;
             })
             .catch(function (error) {
               dispatch('handleError', error);
               resource.loading = false;
             });
        },
        loadRecipes ({ dispatch, commit }) {
            axios.get('/recipe')
              .then(function (response) {
                commit('setRecipes', response.data);
              })
              .catch(function (error) {
                dispatch('handleError', error);
              });
        },
        addNewRecipe({dispatch, commit}, payload) {
            let csrfToken = document.getElementsByClassName('csrfToken')[0].innerText;
            axios.post('/recipe',  {
                  name: payload.name,
                  _csrf: csrfToken
              })
              .then(function (response) {
                dispatch('loadRecipes');
              })
              .catch(function (error) {
                dispatch('handleError', error);
              });
        },
        addNewRecipe({dispatch, commit}, payload) {
            let csrfToken = document.getElementsByClassName('csrfToken')[0].innerText;
            axios.post('/recipe',  {
                  name: payload.name,
                  _csrf: csrfToken
              })
              .then(function (response) {
                dispatch('loadRecipes');
              })
              .catch(function (error) {
                dispatch('handleError', error);
              });
        },
        deleteRecipe({dispatch, commit}, recipe) {
            let csrfToken = document.getElementsByClassName('csrfToken')[0].innerText;
            axios.delete('/recipe',  { data: {
                  recipe: recipe,
                  _csrf: csrfToken
              }})
              .then(function (response) {
                dispatch('loadRecipes');
              })
              .catch(function (error) {
                dispatch('handleError', error);
              });
        },
        updateRecipe({dispatch, commit}, recipe) {
           recipe.loading = true;
           let csrfToken = document.getElementsByClassName('csrfToken')[0].innerText;
           axios.put('/recipe',  {
                 recipe: recipe,
                 _csrf: csrfToken
             })
             .then(function (response) {
               dispatch('loadRecipes');
               recipe.loading = false;
             })
             .catch(function (error) {
               dispatch('handleError', error);
               recipe.loading = false;
             });
        },
      }
    });
   return store;
}