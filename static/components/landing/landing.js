import Profile from '../profile/profile.js';
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
        },
        hasUserProfile() {
            return this.$store.getters.hasUserProfile
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
                                    <li class="viewLink" :class="{ selected: view.code == this.selectedView }"
                                        v-for="view in this.VIEWS" @click="selectView(view.code)">
                                      <span class="viewLinkSpan">{{ view.label }}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </td>
                    <td class="layout-columns col-md-8">
                        <MainView/>
                    </td>
                    <td class="layout-columns col-md-2">
                        <div class="right-bar">
                            <Profile/>
                        </div>
                        <AlertsView/>
                    </td>
                </tr>
            </table>
        </div>
    `
}