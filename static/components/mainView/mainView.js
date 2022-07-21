import { VIEWS } from '../constants.js';
import Stronghold from '../stronghold/stronghold.js'
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
        Logs
    },
    template:
    `
        <div class="mainViewDiv">
            <Stronghold v-if="selectedView == 'STRONGHOLD'"/>
            <Logs v-if="selectedView == 'LOGS'"/>
        </div>
    `
}