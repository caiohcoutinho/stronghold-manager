import Profile from '../profile.js';
import { VIEWS } from '../constants.js';

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
        Profile
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
        <div>
            <h1>Welcome</h1>
            <ul>
                <li :class="{ selected: view.code == this.selectedView }"
                    v-for="view in this.VIEWS" @click="selectView(view.code)">
                  {{ view.label }}
                </li>
            </ul>
        </div>

        <Profile></Profile>
    `
}