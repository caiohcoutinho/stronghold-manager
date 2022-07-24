import { VIEWS } from '../constants.js';
import Stronghold from '../stronghold/stronghold.js'
import Scenario from '../scenario/scenario.js'
import Resource from '../resource/resource.js'
import Recipe from '../recipe/recipe.js'
import Logs from '../logsView.js'

export default {
    computed: {
        selectedView() {
            return this.$store.state.selectedView;
        }
    },
    created() {
        this.VIEWS = VIEWS;
    },
    methods: {
        selectView: function(view){
            this.$store.commit("selectView", view);
        }
    },
    components: {
        Stronghold,
        Scenario,
        Resource,
        Recipe,
        Logs
    },
    template:
    `
        <div class="mainViewDiv">
            <Stronghold v-if="selectedView == 'STRONGHOLD'"/>
            <Scenario v-if="selectedView == 'SCENARIO'"/>
            <Resource v-if="selectedView == 'RESOURCE'"/>
            <Recipe v-if="selectedView == 'RECIPE'"/>
            <Logs v-if="selectedView == 'LOGS'"/>
        </div>
    `
}