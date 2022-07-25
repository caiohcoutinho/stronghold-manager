import { TEXT_INPUT_THROTTLE } from '../constants.js'
import NodeRoot from './nodeRoot.js'

export default {
    data() {
        return {
            modal: null,
            selectedRecipe: null,
            formula: null
        }
    },
    computed: {
        recipes() {
            return this.$store.state.recipes;
        },
        hasUserProfile() {
            return this.$store.getters.hasUserProfile
        },
        scenarios() {
            return this.$store.state.scenarios;
        }
    },
    created() {
    },
    methods: {
        loadScenarios(){
            this.$store.dispatch("loadScenarios");
        },
        loadRecipes(){
            this.$store.dispatch("loadRecipes");
        },
        loadResources(){
            this.$store.dispatch("loadResources");
        },
        addNewRecipe(){
            this.$store.dispatch("addNewRecipe", {name: "New Recipe"});
        },
        deleteRecipe(recipe){
            this.selectedRecipe = recipe;
            this.modal = new bootstrap.Modal(document.getElementById('exampleModal'));
            this.modal.show();
        },
        confirmDeleteRecipe(){
            this.$store.dispatch('deleteRecipe', this.selectedRecipe);
            this.modal.hide();
            this.modal = null;
            this.selectedRecipe = null;
        },
        updateRecipeName: (function(){
            return _.throttle(function(recipe){
                  this.$store.dispatch('updateRecipe', recipe);
              }, TEXT_INPUT_THROTTLE);
        })(),
        updateRecipeScenario(recipe) {
            this.$store.dispatch('updateRecipe', recipe);
        },
        editFormula(recipe){
            if(recipe.formula == null){
                recipe.formula = {id:'Root', count:0};
            } else {
                
            }
            this.selectedRecipe = recipe;
            this.formula = this.selectedRecipe.formula;
            this.previousFormula = JSON.stringify(recipe.formula);
            this.modal = new bootstrap.Modal(document.getElementById('formulaEdition'));
            this.modal.show();
        },
        updateStructure(newFormula){
            this.formula = newFormula;
        },
        confirmEditFormula(){
            if(this.previousFormula != JSON.stringify(this.formula)){
                console.log("Updating recipe because formula changed");
                this.selectedRecipe.formula = this.formula;
                this.$store.dispatch('updateRecipe', this.selectedRecipe);
            } else {
                console.log("Formula didn't change. Skipping update.");
            }
            this.modal.hide();
            this.previousFormula = null;
            this.formula = null;
            this.modal = null;
            this.selectedRecipe = null;
        }
    },
    mounted: function(){
        if(this.hasUserProfile) {
            this.loadScenarios();
            this.loadResources();
            this.loadRecipes();
        }
    },
    watch: {
        hasUserProfile(newValue, oldValue){
            if (newValue) {
                this.loadScenarios();
                this.loadRecipes();
            }
        }
    },
    components: {
        NodeRoot
    },
    template:
    `
        <h1>Recipe</h1>
        <div v-if="!hasUserProfile">
            <h5>Please login</h5>
        </div>
        <div v-if="hasUserProfile">
            <table class="table">
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Formula</th>
                    <th>Scenario</th>
                    <th>Owner</th>
                </tr>
                <tr v-for="recipe in recipes">
                    <td>
                        <span v-if="!recipe.loading" @click="deleteRecipe(recipe)" class="deleteRecipeButton"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                        </svg></span>
                        <span v-if="recipe.loading" class="loadingIcon"><img class="loadingImg" src="/components/loading.gif"/></span>
                    </td>
                    <td><input type="text" v-model="recipe.name" @input="updateRecipeName(recipe)"/></td>
                    <td class="editFormula">
                        <button type="button" class="btn btn-link" @click="editFormula(recipe)">Editar</button>
                    </td>
                    <td class="scenarioSelectTd">
                        <select class="form-select scenarioSelect" aria-label="Default select example"
                            v-model="recipe.scenario_id" @change="updateRecipeScenario(recipe)">
                          <option selected v-bind:value="null"></option>
                          <option v-for="scenario in scenarios" v-bind:value="scenario.id">{{scenario.name}}</option>
                        </select></td>
                    <td>{{recipe.owner_name}}</td>
                </tr>
                <tr>
                    <td colspan="5">
                        <span @click="addNewRecipe" class="addNewButton">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
                            </svg> New
                        </span>
                    </td>
                </tr>
            </table>

            <!-- Modal -->
            <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Delete Recipe</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    Are you sure you want to delete {{selectedRecipe ? selectedRecipe.name: '' }}? This operation cannot be undone.
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button @click="confirmDeleteRecipe()" type="button" class="btn btn-primary">Delete</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal -->
            <div class="modal fade" id="formulaEdition" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div class="modal-dialog modal-xl">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Formula</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <NodeRoot v-if="formula != null" :structure="formula"
                        @updateStructure="updateStructure($event)"/>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button @click="confirmEditFormula()" type="button" class="btn btn-primary">Confirm</button>
                  </div>
                </div>
              </div>
            </div>
        </div>
    `
}