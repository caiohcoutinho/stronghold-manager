import { TEXT_INPUT_THROTTLE } from '../constants.js'

export default {
    data() {
        return {
            modal: null,
            selectedStronghold: null,
        }
    },
    computed: {
        strongholds() {
            return this.$store.state.strongholds;
        },
        hasUserProfile() {
            return this.$store.getters.hasUserProfile
        },
        scenarios() {
            return this.$store.state.scenarios;
        }
    },
    created() {},
    methods: {
        loadScenarios() {
            this.$store.dispatch("loadScenarios");
        },
        loadStrongholds() {
            this.$store.dispatch("loadStrongholds");
        },
        addNewStronghold() {
            this.$store.dispatch("addNewStronghold", { name: "New Stronghold" });
        },
        deleteStronghold(stronghold) {
            this.selectedStronghold = stronghold;
            this.modal = new bootstrap.Modal(document.getElementById('exampleModal'));
            this.modal.show();
        },
        confirmDeleteStronghold() {
            this.$store.dispatch('deleteStronghold', this.selectedStronghold);
            this.modal.hide();
            this.modal = null;
            this.selectedStronghold = null;
        },
        updateStrongholdName: (function() {
            return _.throttle(function(stronghold) {
                this.$store.dispatch('updateStronghold', stronghold);
            }, TEXT_INPUT_THROTTLE);
        })(),
        updateStrongholdScenario(stronghold) {
            this.$store.dispatch('updateStronghold', stronghold);
        },
    },
    mounted: function() {
        if (this.hasUserProfile) {
            this.loadScenarios();
            this.loadStrongholds();
        }
    },
    watch: {
        hasUserProfile(newValue, oldValue) {
            if (newValue) {
                this.loadScenarios();
                this.loadStrongholds();
            }
        }
    },
    template: `
        <h1>Stronghold</h1>
        <div v-if="!hasUserProfile">
            <h5>Please login</h5>
        </div>
        <div v-if="hasUserProfile">
            <table class="table">
                <tbody>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Scenario</th>
                        <th>Owner</th>
                    </tr>
                    <tr v-for="stronghold in strongholds">
                        <td>
                            <span v-if="!stronghold.loading" @click="deleteStronghold(stronghold)" class="deleteStrongholdButton"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                            </svg></span>
                            <span v-if="stronghold.loading" class="loadingIcon"><img class="loadingImg" src="/components/loading.gif"/></span>
                        </td>
                        <td><input type="text" v-model="stronghold.name" @input="updateStrongholdName(stronghold)"/></td>
                        <td class="scenarioSelectTd">
                            <select class="form-select scenarioSelect" aria-label="Default select example"
                                v-model="stronghold.scenario_id" @change="updateStrongholdScenario(stronghold)">
                            <option selected v-bind:value="null"></option>
                            <option v-for="scenario in scenarios" v-bind:value="scenario.id">{{scenario.name}}</option>
                            </select></td>
                        <td>{{stronghold.owner_name}}</td>
                    </tr>
                    <tr>
                        <td colspan="4">
                            <span @click="addNewStronghold" class="addNewButton">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
                                </svg> New
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Modal -->
            <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Delete Stronghold</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    Are you sure you want to delete {{selectedStronghold ? selectedStronghold.name: '' }}? This operation cannot be undone.
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button @click="confirmDeleteStronghold()" type="button" class="btn btn-primary">Delete</button>
                  </div>
                </div>
              </div>
            </div>
        </div>
    `
}