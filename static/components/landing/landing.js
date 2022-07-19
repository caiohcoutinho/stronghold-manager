import Profile from '../profile.js';
import MainView from '../mainView/mainView.js';
import { VIEWS } from '../constants.js';
import AlertsView from '../alerts/alertsView.js'

export default {
    data() {
      return {
        salute: 'Hey pal!'
      }
    },
    computed: {
        selectedView() {
            return this.$store.state.selectedView;
        }
    },
    components: {
        Profile,
        MainView,
        AlertsView
    },
    created() {
        this.VIEWS = VIEWS;
    },
    methods: {
        selectView: function(view){
            this.$store.commit("selectView", view);
        }
    },
    template:
    `
        <div class="root container-fluid landing">
            <table class="main-table">
                <tr>
                    <td class="layout-columns col-md-2">
                        <div class="menu-bar">
                            <div class="inner-menu-bar">
                                <ul>
                                    <li :class="{ selected: view.code == this.selectedView }"
                                        v-for="view in this.VIEWS" @click="selectView(view.code)">
                                      {{ view.label }}
                                    </li>
                                </ul>
                                <Profile/>
                            </div>
                        </div>
                    </td>
                    <td class="layout-columns col-md-10">
                        <MainView/>
                        <AlertsView/>
                    </td>
                </tr>
            </table>
        </div>
    `
}