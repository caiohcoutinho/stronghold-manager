import { VIEWS } from '../constants.js';
import Stronghold from '../stronghold/stronghold.js'
import Scenario from '../scenario/scenario.js'
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
        Logs
    },
    template:
    `
        <div class="mainViewDiv">
            <Stronghold v-if="selectedView == 'STRONGHOLD'"/>
            <Scenario v-if="selectedView == 'SCENARIO'"/>
            <Logs v-if="selectedView == 'LOGS'"/>
        </div>
    `
}