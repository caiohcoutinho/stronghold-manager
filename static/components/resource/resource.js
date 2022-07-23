import { TEXT_INPUT_THROTTLE } from '../constants.js'
import { ICON_TYPES } from '../icon/icon.js'
import CustomIcon from '../icon/icon.js'
const Sketch = VueColor.Sketch;
import Color from '../icon/color.js';
import Solver from '../icon/solver.js';

export default {
    data() {
        return {
            modal: null,
            selectedResource: null,
            color: {hex: '#194d33'},
            icon: null,
            filter: null
        }
    },
    computed: {
        resources() {
            return this.$store.state.resources;
        },
        hasUserProfile() {
            return this.$store.getters.hasUserProfile
        },
        scenarios() {
            return this.$store.state.scenarios;
        },
        iconTypes() {
            return ICON_TYPES;
        }
    },
    components: {
        Sketch, CustomIcon, ICON_TYPES
    },
    methods: {
        calculateFilter(){
            const rgb = this.hexToRgb(this.color.hex);
            const color = new Color(rgb[0], rgb[1], rgb[2]);
            const solver = new Solver(color);
            const result = solver.solve();
            this.filter = result.filter;
        },
        hexToRgb(hex) {
          // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
          const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
          hex = hex.replace(shorthandRegex, (m, r, g, b) => {
            return r + r + g + g + b + b;
          });

          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result
            ? [
              parseInt(result[1], 16),
              parseInt(result[2], 16),
              parseInt(result[3], 16),
            ]
            : null;
        },
        loadScenarios(){
            this.$store.dispatch("loadScenarios");
        },
        loadResources(){
            this.$store.dispatch("loadResources");
        },
        addNewResource(){
            this.$store.dispatch("addNewResource", {name: "New Resource"});
        },
        deleteResource(resource){
            this.selectedResource = resource;
            this.modal = new bootstrap.Modal(document.getElementById('exampleModal'));
            this.modal.show();
        },
        confirmDeleteResource(){
            this.$store.dispatch('deleteResource', this.selectedResource);
            this.modal.hide();
            this.modal = null;
            this.selectedResource = null;
        },
        updateResourceName: (function(){
            return _.throttle(function(resource){
                  this.$store.dispatch('updateResource', resource);
              }, TEXT_INPUT_THROTTLE);
        })(),
        updateResourceScenario(resource) {
            this.$store.dispatch('updateResource', resource);;
        },
        editIcon(resource){
            this.selectedResource = resource;
            this.color = {hex: '#194d33'};
            this.icon = null;
            this.calculateFilter();
            this.modal = new bootstrap.Modal(document.getElementById('iconEdition'));
            this.modal.show();
        }
    },
    mounted: function(){
        if(this.hasUserProfile) {
            this.loadScenarios();
            this.loadResources();
        }
    },
    watch: {
        hasUserProfile(newValue, oldValue){
            if (newValue) {
                this.loadScenarios();
                this.loadResources();
            }
        }
    },
    template:
    `
        <h1>Resource</h1>
        <div v-if="!hasUserProfile">
            <h5>Please login</h5>
        </div>
        <!--<CustomIcon type="wrench" hexColor="#EE4540"/>-->
        <div v-if="hasUserProfile">
            <table class="table">
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Icon</th>
                    <th>Scenario</th>
                    <th>Owner</th>
                </tr>
                <tr v-for="resource in resources">
                    <td>
                        <span v-if="!resource.loading" @click="deleteResource(resource)" class="deleteResourceButton"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                        </svg></span>
                        <span v-if="resource.loading" class="loadingIcon"><img class="loadingImg" src="/components/loading.gif"/></span>
                    </td>
                    <td><input type="text" v-model="resource.name" @input="updateResourceName(resource)"/></td>
                    <td><button type="button" class="btn btn-link" @click="editIcon(resource)">Editar</button></td>
                    <td class="scenarioSelectTd">
                        <select class="form-select scenarioSelect" aria-label="Default select example"
                            v-model="resource.scenario_id" @change="updateResourceScenario(resource)">
                          <option selected v-bind:value="null"></option>
                          <option v-for="scenario in scenarios" v-bind:value="scenario.id">{{scenario.name}}</option>
                        </select></td>
                    <td>{{resource.owner_name}}</td>
                </tr>
                <tr>
                    <td colspan="5">
                        <span @click="addNewResource" class="addNewButton">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
                            </svg> New
                        </span>
                    </td>
                </tr>
            </table>

            <!-- Modal -->
            <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="deleteResourceModal" aria-hidden="true">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="deleteResourceModal">Delete Resource</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    Are you sure you want to delete {{selectedResource ? selectedResource.name: '' }}? This operation cannot be undone.
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button @click="confirmDeleteResource()" type="button" class="btn btn-primary">Delete</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal -->
            <div class="modal fade" id="iconEdition" tabindex="-1" aria-labelledby="editIconModal" aria-hidden="true">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="editIconModal">Edit Icon</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <table class="editIconTable">
                        <tr>
                            <td><button type="button" class="btn btn-secondary" @click="calculateFilter()">Calcular Filtro</button></td>
                            <td>
                                <select class="form-select scenarioSelect" aria-label="Default select example" v-model="icon" >
                                  <option selected v-bind:value="null"></option>
                                  <option v-for="iconType in iconTypes" :value="iconType">{{iconType}}</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td><Sketch v-model="color"></Sketch></td>
                            <td><CustomIcon class="bigIcon" :type="icon" :filter="filter"/></td>
                        </tr>
                    </table>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button @click="confirmEditIcon" type="button" class="btn btn-primary">Delete</button>
                  </div>
                </div>
              </div>
            </div>
        </div>
    `
}
